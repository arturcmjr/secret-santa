import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { FirestoreError } from 'firebase/firestore';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DefaultPageLayoutComponent } from '@shared/components/default-page-layout/default-page-layout.component';
import { ErrorIllustrationComponent } from '../../components/error-illustration/error-illustration.component';
import {
  IParticipant,
  ISecretSanta,
  SecretSantaTypeEnum,
} from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';
import { RevealComponent } from './components/reveal/reveal.component';
import { SuggestionsComponent } from './components/suggestions/suggestions.component';

enum ParticipantState {
  Suggesting,
  Reveal,
}

@Component({
  selector: 'app-participant',
  imports: [
    TranslatePipe,
    DefaultPageLayoutComponent,
    ErrorIllustrationComponent,
    RevealComponent,
    SuggestionsComponent,
  ],
  templateUrl: './participant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantComponent {
  // bound from the `:participantId` route param
  public readonly participantId = input<string>();

  private readonly service = inject(SecretSantaService);
  private readonly translate = inject(TranslateService);

  protected readonly secretSanta = signal<ISecretSanta | undefined>(undefined);
  protected readonly participant = signal<IParticipant | undefined>(undefined);
  protected readonly secretSantaId = signal<string | undefined>(undefined);
  protected readonly errorCode = signal<string | undefined>(undefined);
  protected readonly title = signal(this.translate.instant('LABELS.PARTICIPANT'));
  protected readonly state = signal<ParticipantState | undefined>(undefined);
  protected readonly ParticipantState = ParticipantState;

  constructor() {
    effect(() => {
      const participantId = this.participantId();
      if (participantId) untracked(() => this.fetchParticipant(participantId));
    });
  }

  private fetchParticipant(participantId: string): void {
    this.service.getParticipant(participantId).subscribe({
      next: (participant) => {
        this.participant.set(participant);
        this.title.set(
          this.translate.instant('MESSAGES.INFO_PARTICIPANT_SS', {
            name: participant.name,
          })
        );
        this.secretSantaId.set(participant.secretSantaRef.id);
        this.fetchSecretSanta(participant.secretSantaRef.id, participant);
      },
      error: (error: FirestoreError) => {
        this.errorCode.set(error?.code || 'UNKNOWN');
      },
    });
  }

  private fetchSecretSanta(secretSantaId: string, participant: IParticipant): void {
    this.service.getSecretSanta(secretSantaId).subscribe({
      next: (secretSanta) => {
        this.secretSanta.set(secretSanta);
        if (
          secretSanta.type === SecretSantaTypeEnum.Suggestions &&
          !secretSanta.suggestionsLocked
        ) {
          this.state.set(ParticipantState.Suggesting);
          this.title.set(
            this.translate.instant('MESSAGES.INTO_PARTICIPANT_SUGGESTIONS', {
              name: participant.name,
            })
          );
        } else {
          this.state.set(ParticipantState.Reveal);
        }
      },
      error: (error: FirestoreError) => {
        this.errorCode.set(error?.code || 'UNKNOWN');
      },
    });
  }
}
