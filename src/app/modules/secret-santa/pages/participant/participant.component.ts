import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreError } from '@firebase/firestore';
import { TranslateService } from '@ngx-translate/core';
import {
  IParticipant,
  ISecretSanta,
  SecretSantaTypeEnum,
} from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';

enum ParticipantState {
  Suggesting,
  Reveal,
}

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
  protected title: string = this.translate.instant('LABELS.PARTICIPANT');
  protected subtitle?: string;
  protected state?: ParticipantState;
  protected readonly ParticipantState = ParticipantState;

  constructor(
    private service: SecretSantaService,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
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
        this.secretSanta = secretSanta;
        if(secretSanta.type === SecretSantaTypeEnum.Suggestions && !secretSanta.suggestionsLocked) {
          this.state = ParticipantState.Suggesting;
          this.title = this.translate.instant('MESSAGES.INTO_PARTICIPANT_SUGGESTIONS', { name: this.participant.name });
        } else {
          this.state = ParticipantState.Reveal;
        }
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
