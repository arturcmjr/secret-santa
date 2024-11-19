import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreError } from '@firebase/firestore';
import {
  IParticipant,
  ISecretSanta,
  SecretSantaTypeEnum,
} from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';

@Component({
  selector: 'app-participant',
  templateUrl: './participant.component.html',
  styleUrl: './participant.component.scss',
})
export class ParticipantComponent {
  protected secretSanta: ISecretSanta;
  protected participant: IParticipant;
  protected isLoading: boolean = true;
  protected errorCode?: string;
  protected title: string = 'LABEL.PARTICIPANT';
  protected subtitle?: string;
  protected shouldSuggest = false;

  constructor(
    private service: SecretSantaService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params) => {
      const { participantId } = params || {};
      if (participantId) this.fetchParticipant(participantId);
    });
  }

  private fetchParticipant(participantId: string): void {
    this.isLoading = true;
    this.service.getParticipant(participantId).subscribe({
      next: (participant) => {
        this.participant = participant;
        this.fetchSecretSanta(participant.secretSantaRef.id);
      },
      error: (error: FirestoreError) => {
        this.errorCode = error?.code || 'UNKNOWN';
        this.isLoading = false;
      },
    });
  }

  private fetchSecretSanta(secretSantaId: string): void {
    this.service.getSecretSanta(secretSantaId).subscribe({
      next: (secretSanta) => {
        console.log(secretSanta);
        this.secretSanta = secretSanta;
        this.shouldSuggest =
          secretSanta.type === SecretSantaTypeEnum.Suggestions &&
          !secretSanta.suggestionsReady;
        this.subtitle = `${secretSanta.name}\n${secretSanta.description}`;
        this.isLoading = false;
      },
      error: (error: FirestoreError) => {
        this.errorCode = error?.code || 'UNKNOWN';
        this.isLoading = false;
      },
    });
  }
}
