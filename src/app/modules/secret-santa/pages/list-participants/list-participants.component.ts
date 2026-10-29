import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { Title } from '@angular/platform-browser';
import { FirestoreError } from 'firebase/firestore';
import { LucideCheck, LucideCopy, LucideLink, LucideShare2 } from '@lucide/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { DefaultPageLayoutComponent } from '@shared/components/default-page-layout/default-page-layout.component';
import { NotificationService } from '@shared/services/notification.service';
import {
  IParticipant,
  ISecretSanta,
  SecretSantaTypeEnum,
} from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';
import { ErrorIllustrationComponent } from '../../components/error-illustration/error-illustration.component';

@Component({
  selector: 'app-list-participants',
  imports: [
    TranslatePipe,
    LucideCheck,
    LucideCopy,
    LucideLink,
    LucideShare2,
    DefaultPageLayoutComponent,
    ErrorIllustrationComponent,
    ConfirmationDialogComponent,
  ],
  templateUrl: './list-participants.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListParticipantsComponent {
  // bound from the `:secretSantaId` route param
  public readonly secretSantaId = input<string>();

  private readonly service = inject(SecretSantaService);
  private readonly clipboard = inject(Clipboard);
  private readonly notification = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly titleService = inject(Title);

  protected readonly participants = signal<IParticipant[]>([]);
  protected readonly revealedCounts = signal<Record<string, number>>({});
  protected readonly title = signal('');
  protected readonly subtitle = signal('');
  protected readonly errorCode = signal<string | null>(null);
  protected readonly secretSanta = signal<ISecretSanta | undefined>(undefined);
  protected readonly isConfirmingLock = signal(false);
  protected readonly isSuggesting = computed(
    () =>
      this.secretSanta()?.type === SecretSantaTypeEnum.Suggestions &&
      !this.secretSanta()?.suggestionsLocked
  );

  constructor() {
    effect(() => {
      const secretSantaId = this.secretSantaId();
      if (secretSantaId) untracked(() => this.fetchData(secretSantaId));
    });
  }

  private fetchData(secretSantaId: string): void {
    this.errorCode.set(null);
    const participants$ = this.service.getParticipants(secretSantaId);
    const secretSanta$ = this.service.getSecretSanta(secretSantaId);

    combineLatest([participants$, secretSanta$]).subscribe({
      next: ([participants, secretSanta]) => {
        this.secretSanta.set(secretSanta);
        this.participants.set(participants);
        const title = this.translate.instant('MESSAGES.INFO_PARTICIPANTS_LIST', {
          name: secretSanta.name,
        });
        if (this.isSuggesting()) {
          this.subtitle.set(
            this.translate.instant('MESSAGES.INFO_SHARE_SUGGESTIONS')
          );
        } else {
          this.subtitle.set(
            this.translate.instant('MESSAGES.INFO_SHARE_REVEAL')
          );
          this.fetchRevelationsCount(participants);
        }
        this.titleService.setTitle(title);
        this.title.set(title);
      },
      error: (error: FirestoreError) => {
        this.errorCode.set(error?.code || 'UNKNOWN');
      },
    });
  }

  private fetchRevelationsCount(participants: IParticipant[]): void {
    this.revealedCounts.set({});
    participants.forEach((participant) => {
      this.service
        .getRevelationCount(participant.revelationRef.id)
        .subscribe((count) => {
          if (!participant.id) return;
          this.revealedCounts.update((counts) => ({
            ...counts,
            [participant.id!]: count,
          }));
        });
    });
  }

  private getParticipantUrl(participant: IParticipant): string {
    return `${window.location.origin}/participant/${participant.id}`;
  }

  protected copyLinksUrl(): void {
    this.clipboard.copy(window.location.href);
    this.notifyCopied();
  }

  protected lockSuggestions(): void {
    this.isConfirmingLock.set(true);
  }

  protected onLockConfirmation(confirmed: boolean): void {
    this.isConfirmingLock.set(false);
    const secretSantaId = this.secretSantaId();
    if (!confirmed || !secretSantaId) return;
    this.service.lockSuggestions(secretSantaId).subscribe(() => {
      this.fetchData(secretSantaId);
    });
  }

  protected copyParticipantToClipboard(participant: IParticipant): void {
    this.clipboard.copy(this.getParticipantUrl(participant));
    this.notifyCopied();
  }

  protected participantHasSuggested(participant: IParticipant): boolean {
    return Array.isArray(participant.suggestions);
  }

  protected shareSanta(participant: IParticipant): void {
    if (navigator.share) {
      const title: string = this.translate.instant('MESSAGES.INFO_SHARE_TITLE', {
        name: participant.name,
      });
      navigator.share({
        title,
        url: this.getParticipantUrl(participant),
      });
    } else {
      this.copyParticipantToClipboard(participant);
    }
  }

  private notifyCopied(): void {
    const message = this.translate.instant('MESSAGES.INFO_CLIPBOARD_SUCCESS');
    this.notification.show(message, 'success');
  }
}
