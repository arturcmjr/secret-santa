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
import { Observable } from 'rxjs';
import { FirebaseService } from '../firebase.service';
import {
  ICreateSecretSanta,
  ISecretSanta,
  IParticipant,
  IRevelation,
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
    const { name, description, date, participants } = data;

    return new Observable((observer) => {
      const db = this.database;
      const batch = writeBatch(db);
      const secretSantaRef = doc(db, 'secretSantas', generateUniqueId());
      batch.set(secretSantaRef, { name, description, date });

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

      batch
        .commit()
        .then((res) => {
          observer.next(secretSantaRef);
          observer.complete();
        })
        .catch((err) => {
          // TODO: handle errors
          console.error(err);
        });
    });
  }

  public getParticipant(participantId: string): Observable<IParticipant> {
    // TODO: handle error
    return new Observable((observer) => {
      const ref = doc(
        this.database,
        `participants`,
        participantId
      ) as DocumentReference<IParticipant>;
      getDoc(ref).then((doc) => {
        observer.next(doc.data());
        observer.complete();
      });
    });
  }

  public revealSecretSanta(participant: IParticipant): Observable<IRevelation> {
    // TODO: handle errors
    return new Observable((observer) => {
      getDoc(participant.revelationRef).then((doc) => {
        const revelation = doc.data() as IRevelation;
        setDoc(
          participant.revelationRef,
          {
            revealedCount: revelation.revealedCount + 1,
          },
          { merge: true }
        ).then(() => {
          observer.next(doc.data());
          observer.complete();
        });
      });
    });
  }

  public getSecretSanta(participant: IParticipant): Observable<ISecretSanta> {
    // TODO: handle errors
    return new Observable((observer) => {
      getDoc(participant.secretSantaRef).then((doc) => {
        const secretSanta = doc.data() as ISecretSanta;
        observer.next(secretSanta);
        observer.complete();
      });
    });
  }

  public getParticipants(secretSantaId: string): Observable<IParticipant[]> {
    return new Observable((observer) => {
      const secretSantaRef = doc(this.database, 'secretSantas', secretSantaId);

      const q = query(
        collection(this.database, 'participants'),
        where('secretSantaRef', '==', secretSantaRef)
      );

      getDocs(q).then((docs) => {
        const data = docs.docs.map((doc) => {
          const participant = doc.data() as IParticipant;
          participant.id = doc.id;
          return participant;
        }) as IParticipant[];
        observer.next(data);
        observer.complete();
      });
    });
  }
}
