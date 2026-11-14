import {
  inject,
  Injectable,
  makeStateKey,
  PendingTasks,
  PLATFORM_ID,
  StateKey,
  TransferState,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { generateUniqueId } from '@shared/utils/generate-unique-id';
import {
  collection,
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { defer, from, Observable, map, of, switchMap } from 'rxjs';
import { FirebaseService } from '@core/services/firebase.service';
import { LoadingService } from '@core/services/loading.service';
import {
  ICreateSecretSanta,
  ISecretSanta,
  IParticipant,
  IRevelation,
  SecretSantaTypeEnum,
} from '../models/secret-santa.interface';

// Firestore references and timestamps are not JSON friendly, so they travel as plain paths/seconds
interface ITransferParticipant extends Omit<IParticipant, 'revelationRef' | 'secretSantaRef'> {
  revelationPath: string;
  secretSantaPath: string;
}

interface ITransferSecretSanta extends Omit<ISecretSanta, 'date'> {
  date: { seconds: number; nanoseconds: number };
}

// Components only read `code`, so a plain error keeps the shape of the SDK's FirestoreError
const firestoreError = (code: string) => Object.assign(new Error(code), { code });

const SERVER_FETCH_TIMEOUT_MS = 8000;

@Injectable({
  providedIn: 'root',
})
export class SecretSantaService {
  private readonly database: Firestore = inject(FirebaseService).getDatabase();
  private readonly loading = inject(LoadingService);
  private readonly transferState = inject(TransferState);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));

  // Data fetched while server rendering is handed to the browser so it renders the same DOM without refetching
  private fetchWithTransfer<T, S>(
    key: StateKey<S>,
    load: () => Promise<T>,
    serialize: (value: T) => S,
    deserialize: (value: S) => T
  ): Observable<T> {
    if (this.isServer) {
      return defer(async () => {
        const done = this.pendingTasks.add();
        try {
          const value = await this.withTimeout(load());
          this.transferState.set(key, serialize(value));
          return value;
        } finally {
          done();
        }
      });
    }
    if (this.transferState.hasKey(key)) {
      const cached = this.transferState.get<S | null>(key, null) as S;
      this.transferState.remove(key);
      return of(deserialize(cached));
    }
    return this.loading.track(from(load()));
  }

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(firestoreError('deadline-exceeded')),
          SERVER_FETCH_TIMEOUT_MS
        )
      ),
    ]);
  }

  public createSecretSanta(
    data: ICreateSecretSanta
  ): Observable<DocumentReference> {
    const { name, description, date, participants, type, maxSuggestions, suggestionsDescription } = data;

    const db = this.database;
    const batch = writeBatch(db);
    const secretSantaRef = doc(db, 'secretSantas', generateUniqueId());
    batch.set(secretSantaRef, {
      name,
      description,
      date,
      type,
      ...(maxSuggestions !== undefined ? { maxSuggestions } : {}),
      ...(suggestionsDescription ? { suggestionsDescription } : {}),
      ...(type === SecretSantaTypeEnum.Suggestions ? {} : { suggestionsLocked: true }),
    });

    participants.forEach((participant) => {
      const revelationRef = doc(db, 'revelations', generateUniqueId());
      const participantRef = doc(db, 'participants', generateUniqueId());
      batch.set(revelationRef, {
        name: participant.secretSanta,
        revealedCount: 0,
      });
      batch.set(participantRef, {
        name: participant.name,
        revelationRef,
        secretSantaRef,
      });
    });

    const batchCommand = batch.commit();
    return this.loading.track(from(batchCommand).pipe(map(() => secretSantaRef)));
  }

  public getParticipant(participantId: string): Observable<IParticipant> {
    return this.fetchWithTransfer<IParticipant, ITransferParticipant>(
      makeStateKey(`participant:${participantId}`),
      async () => {
        const snapshot = await getDoc(doc(this.database, 'participants', participantId));
        if (!snapshot.exists()) throw firestoreError('not-found');
        return snapshot.data() as IParticipant;
      },
      ({ revelationRef, secretSantaRef, ...participant }) => ({
        ...participant,
        revelationPath: revelationRef.path,
        secretSantaPath: secretSantaRef.path,
      }),
      ({ revelationPath, secretSantaPath, ...participant }) => ({
        ...participant,
        revelationRef: doc(this.database, revelationPath) as DocumentReference<IRevelation>,
        secretSantaRef: doc(this.database, secretSantaPath) as DocumentReference<ISecretSanta>,
      })
    );
  }

  public getRevelationSuggestions(secretSantaId: string, participantName: string): Observable<string[] | undefined> {
    const secretSantaRef = doc(this.database, 'secretSantas', secretSantaId);
    const quer = query(
      collection(this.database, 'participants'),
      where('secretSantaRef', '==', secretSantaRef),
      where('name', '==', participantName)
    );
    const docsQuery = getDocs(quer);
    return this.loading.track(from(docsQuery).pipe(
      map((docs) => {
        const data = docs.docs.map((doc) => {
          const participant = doc.data() as IParticipant;
          participant.id = doc.id;
          return participant;
        }) as IParticipant[];
        return data[0]?.suggestions;
      })
    ));
  }

  public setParticipantSuggestions(participantId: string, suggestions: string[]): Observable<void> {
    const ref = doc(this.database, 'participants', participantId);
    const docCommand = setDoc(ref, { suggestions }, { merge: true });
    return this.loading.track(from(docCommand));
  }

  public lockSuggestions(secretSantaId: string): Observable<void> {
    const ref = doc(this.database, 'secretSantas', secretSantaId);
    const docCommand = setDoc(ref, { suggestionsLocked: true }, { merge: true });
    return this.loading.track(from(docCommand));
  }

  public getRevelationCount(revelationId: string): Observable<number> {
    const ref = doc(
      this.database,
      `revelations`,
      revelationId
    ) as DocumentReference<IRevelation>;
    const docQuery = getDoc(ref);
    return this.loading.track(from(docQuery).pipe(
      map((doc) => doc.data() as IRevelation),
      map((revelation) => revelation.revealedCount)
    ));
  }

  private increaseRevelationCount(
    reference: DocumentReference<IRevelation>,
    count: number
  ): Observable<void> {
    const docCommand = setDoc(
      reference,
      {
        revealedCount: count,
      },
      { merge: true }
    );
    return this.loading.track(from(docCommand));
  }

  public revealSecretSanta(participant: IParticipant): Observable<IRevelation> {
    const docObs = from(getDoc(participant.revelationRef));
    return this.loading.track(docObs.pipe(
      map((doc) => doc.data() as IRevelation),
      switchMap((revelation) => {
        const count = revelation.revealedCount + 1;
        return this.increaseRevelationCount(
          participant.revelationRef,
          count
        ).pipe(map(() => revelation));
      })
    ));
  }

  public getSecretSanta(secretSantaId: string): Observable<ISecretSanta> {
    return this.fetchWithTransfer<ISecretSanta, ITransferSecretSanta>(
      makeStateKey(`secretSanta:${secretSantaId}`),
      async () => {
        const snapshot = await getDoc(doc(this.database, 'secretSantas', secretSantaId));
        if (!snapshot.exists()) throw firestoreError('not-found');
        return snapshot.data() as ISecretSanta;
      },
      (secretSanta) => {
        const timestamp = secretSanta.date as unknown as Timestamp;
        return {
          ...secretSanta,
          date: { seconds: timestamp.seconds, nanoseconds: timestamp.nanoseconds },
        };
      },
      ({ date, ...secretSanta }) => ({
        ...secretSanta,
        date: new Timestamp(date.seconds, date.nanoseconds) as unknown as Date,
      })
    );
  }

  public getParticipants(secretSantaId: string): Observable<IParticipant[]> {
    return this.fetchWithTransfer<IParticipant[], ITransferParticipant[]>(
      makeStateKey(`participants:${secretSantaId}`),
      async () => {
        const secretSantaRef = doc(this.database, 'secretSantas', secretSantaId);
        const docs = await getDocs(
          query(collection(this.database, 'participants'), where('secretSantaRef', '==', secretSantaRef))
        );
        return docs.docs.map((snapshot) => {
          const participant = snapshot.data() as IParticipant;
          participant.id = snapshot.id;
          return participant;
        });
      },
      (participants) =>
        participants.map(({ revelationRef, secretSantaRef, ...participant }) => ({
          ...participant,
          revelationPath: revelationRef.path,
          secretSantaPath: secretSantaRef.path,
        })),
      (participants) =>
        participants.map(({ revelationPath, secretSantaPath, ...participant }) => ({
          ...participant,
          revelationRef: doc(this.database, revelationPath) as DocumentReference<IRevelation>,
          secretSantaRef: doc(this.database, secretSantaPath) as DocumentReference<ISecretSanta>,
        }))
    );
  }
}
