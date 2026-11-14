import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  PLATFORM_ID,
  signal,
  untracked,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { FirestoreError } from 'firebase/firestore';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DefaultPageLayoutComponent } from '@layout/default-page-layout/default-page-layout.component';
import { ErrorStateComponent } from '../../components/error-state/error-state.component';
import {
  IParticipant,
  ISecretSanta,
  SecretSantaTypeEnum,
} from '@features/secret-santa/models/secret-santa.interface';
import { SeoService } from '@core/services/seo.service';
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
    ErrorStateComponent,
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
  private readonly seo = inject(SeoService);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));

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
        this.fetchSecretSanta(participant.secretSantaRef.id, participant, participantId);
      },
      error: (error: FirestoreError) => this.handleError(error),
    });
  }

  private fetchSecretSanta(
    secretSantaId: string,
    participant: IParticipant,
    participantId: string
  ): void {
    this.service.getSecretSanta(secretSantaId).subscribe({
      next: (secretSanta) => {
        this.secretSanta.set(secretSanta);
        this.savedLinks.registerReveal(
          participantId,
          participant.name,
          secretSanta.name,
          secretSanta.date
        );
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
        this.updateSeo(participant, secretSanta);
      },
      error: (error: FirestoreError) => this.handleError(error),
    });
  }

  // Previews only carry the participant and event info, never who was drawn
  private async updateSeo(participant: IParticipant, secretSanta: ISecretSanta): Promise<void> {
    const suggesting =
      secretSanta.type === SecretSantaTypeEnum.Suggestions && !secretSanta.suggestionsLocked;
    const prefix = suggesting ? 'SEO.PARTICIPANT.SUGGESTIONS_' : 'SEO.PARTICIPANT.';
    const params = {
      name: participant.name,
      event: secretSanta.name,
      date: this.seo.formatEventDate(secretSanta.date),
    };
    const [title, description] = await Promise.all([
      this.seo.translateKey(`${prefix}TITLE`, params),
      this.seo.translateKey(`${prefix}DESCRIPTION`, params),
    ]);
    this.seo.update({
      title,
      description: [description, secretSanta.description].filter(Boolean).join(' '),
      noindex: true,
    });
  }

  // On the server a failed fetch is left for the browser to retry, so no error page is cached in the preview
  private handleError(error: FirestoreError): void {
    if (this.isServer) return;
    this.errorCode.set(error?.code || 'UNKNOWN');
    void this.seo.updateNotFound();
  }
}
