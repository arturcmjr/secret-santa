import { Injectable } from '@angular/core';
import { generateUniqueId } from '@shared/helpers/utils/generate-unique-id';
import {
  collection,
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { from, Observable, map, switchMap } from 'rxjs';
import { FirebaseService } from '../firebase.service';
import {
  ICreateSecretSanta,
  ISecretSanta,
  IParticipant,
  IRevelation,
  SecretSantaTypeEnum,
} from './secret-santa.interface';

@Injectable({
  providedIn: 'root',
})
export class SecretSantaService {
  private database: Firestore;

  constructor(private firebaseService: FirebaseService) {
    this.database = this.firebaseService.getDatabase();
  }

  public createSecretSanta(
    data: ICreateSecretSanta
  ): Observable<DocumentReference> {
    const { name, description, date, participants, type } = data;

    const db = this.database;
    const batch = writeBatch(db);
    const secretSantaRef = doc(db, 'secretSantas', generateUniqueId());
    batch.set(secretSantaRef, { name, description, date, type });

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
    return from(batchCommand).pipe(map(() => secretSantaRef));
  }

  public getParticipant(participantId: string): Observable<IParticipant> {
    const ref = doc(
      this.database,
      `participants`,
      participantId
    ) as DocumentReference<IParticipant>;
    const docQuery = getDoc(ref);
    return from(docQuery).pipe(map((doc) => doc.data() as IParticipant));
  }


  public getRevelationCount(revelationId: string): Observable<number> {
    const ref = doc(
      this.database,
      `revelations`,
      revelationId
    ) as DocumentReference<IRevelation>;
    const docQuery = getDoc(ref);
    return from(docQuery).pipe(
      map((doc) => doc.data() as IRevelation),
      map((revelation) => revelation.revealedCount)
    );
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
    return from(docCommand);
  }

  public revealSecretSanta(participant: IParticipant): Observable<IRevelation> {
    const docObs = from(getDoc(participant.revelationRef));
    return docObs.pipe(
      map((doc) => doc.data() as IRevelation),
      switchMap((revelation) => {
        const count = revelation.revealedCount + 1;
        return this.increaseRevelationCount(
          participant.revelationRef,
          count
        ).pipe(map(() => revelation));
      })
    );
  }

  public getSecretSanta(secretSantaId: string): Observable<ISecretSanta> {
    const docs = doc(this.database, 'secretSantas', secretSantaId);
    const docQuery = getDoc(docs);
    return from(docQuery).pipe(map((doc) => doc.data() as ISecretSanta));
  }

  public getParticipants(secretSantaId: string): Observable<IParticipant[]> {
    const secretSantaRef = doc(this.database, 'secretSantas', secretSantaId);

    const quer = query(
      collection(this.database, 'participants'),
      where('secretSantaRef', '==', secretSantaRef)
    );

    const docsQuery = getDocs(quer);
    return from(docsQuery).pipe(
      map((docs) => {
        const data = docs.docs.map((doc) => {
          const participant = doc.data() as IParticipant;
          participant.id = doc.id;
          return participant;
        }) as IParticipant[];
        return data;
      })
    );
  }
}
