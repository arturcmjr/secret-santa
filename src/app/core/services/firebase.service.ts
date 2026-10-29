import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '@env';
import { Firestore, getFirestore } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly db: Firestore = getFirestore(
    initializeApp(environment.firebaseConfig)
  );

  public getDatabase(): Firestore {
    return this.db;
  }
}
