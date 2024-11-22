import { DocumentReference } from "firebase/firestore";

export interface ICreateSecretSanta {
  name: string;
  description: string;
  date: Date;
  type: SecretSantaTypeEnum;
  maxSuggestions?: number;
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
  suggestions?: string[];
}

export interface ISecretSanta {
  name: string;
  description: string;
  date: Date;
  type: SecretSantaTypeEnum;
  maxSuggestions?: number;
  readyForReveal?: boolean;
}

export interface IRevelation {
  name: string;
  revealedCount: number;
}

export enum SecretSantaTypeEnum {
  Default = 0,
  Suggestions = 1,
}