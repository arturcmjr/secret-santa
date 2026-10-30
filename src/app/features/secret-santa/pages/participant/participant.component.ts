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
import { DefaultPageLayoutComponent } from '@layout/default-page-layout/default-page-layout.component';
import { ErrorIllustrationComponent } from '../../components/error-illustration/error-illustration.component';
import {
  IParticipant,
  ISecretSanta,
  SecretSantaTypeEnum,
} from '@features/secret-santa/models/secret-santa.interface';
import { SavedLinksService } from '@core/services/saved-links.service';
import { SecretSantaService } from '@features/secret-santa/services/secret-santa.service';
import { RevealComponent } from '@features/secret-santa/components/reveal/reveal.component';
import { SuggestionsComponent } from '@features/secret-santa/components/suggestions/suggestions.component';

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
  private readonly savedLinks = inject(SavedLinksService);

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
        if (participant.id) {
          this.savedLinks.registerReveal(
            participant.id,
            participant.name,
            secretSanta.name,
            secretSanta.date
          );
        }
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
