import { Injectable } from '@angular/core';
import {
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';

export interface IParticipant {
  name: string;
  revelationRef: DocumentReference<IRevelation>;
  secretSantaRef: DocumentReference<ISecretSanta>;
}

export interface ISecretSanta {
  name: string;
  description: string;
  date: Date;
}

export interface IRevelation {
  name: string;
  revealedCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class SecretSantaService {
  private database: Firestore;

  constructor(private firebaseService: FirebaseService) {
    this.database = this.firebaseService.getDatabase();
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

  public getSecretSanta(participant: IParticipant) : Observable<ISecretSanta> {
    // TODO: handle errors
    return new Observable((observer) => {
      getDoc(participant.secretSantaRef).then((doc) => {
        const secretSanta = doc.data() as ISecretSanta;
        observer.next(secretSanta);
        observer.complete();
      });
    });
  }
}
