import { DocumentReference } from "firebase/firestore";

export interface ICreateSecretSanta {
  name: string;
  description: string;
  date: Date;
  participants: ICreateSecretSantaParticipant[];
}

export interface ICreateSecretSantaParticipant {
  name: string;
  secretSanta: string;
}

export interface IParticipant {
  id?: string;
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