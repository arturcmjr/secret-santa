import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '@env';
import { Firestore, getFirestore } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db: Firestore;

  constructor() {
    const app = initializeApp(environment.firebaseConfig);
    this.db = getFirestore(app);
  }

  public getDatabase(): Firestore {
    return this.db;
  }
}
