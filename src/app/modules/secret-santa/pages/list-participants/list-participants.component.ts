import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FirestoreError } from '@firebase/firestore';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent, ConfirmDialogModel } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  IParticipant as IParticipantBase,
  ISecretSanta,
  SecretSantaTypeEnum,
} from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';
import { combineLatest } from 'rxjs';

export interface IParticipant extends IParticipantBase {
  revealedCount?: number;
}

@Component({
  selector: 'app-list-participants',
  templateUrl: './list-participants.component.html',
  styleUrls: ['./list-participants.component.scss'],
})
export class ListParticipantsComponent implements OnInit {
  protected participants: IParticipant[] = [];
  protected isLoading = false;
  protected title: string;
  protected subtitle: string;
  protected errorCode: string | null = null;
  protected SecretSantaType = SecretSantaTypeEnum;
  protected secretSanta?: ISecretSanta;
  protected isSuggesting = false;
  private secretSantaId?: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private service: SecretSantaService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private titleService: Title,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const { secretSantaId } = params || {};
      this.secretSantaId = secretSantaId;
      if (secretSantaId) this.fetchData(secretSantaId);
    });
  }

  private fetchData(secretSantaId: string): void {
    this.isLoading = true;
    const participants$ = this.service.getParticipants(secretSantaId);
    const secretSanta$ = this.service.getSecretSanta(secretSantaId);

    combineLatest([participants$, secretSanta$]).subscribe({
      next: ([participants, secretSanta]) => {
        this.secretSanta = secretSanta;
        this.participants = participants;
        this.isSuggesting = secretSanta?.type === SecretSantaTypeEnum.Suggestions &&
        !secretSanta?.suggestionsLocked;
        const title = this.translate.instant( 'MESSAGES.INFO_PARTICIPANTS_LIST', { name: secretSanta.name, } );
        if(this.isSuggesting) {
          this.subtitle = this.translate.instant('MESSAGES.INFO_SHARE_SUGGESTIONS');
        } else {
          this.subtitle = this.translate.instant('MESSAGES.INFO_SHARE_REVEAL');
          this.fetchRevelationsCount();
        }
        this.titleService.setTitle(title);

        this.title = title;
        this.isLoading = false;
      },
      error: (error: FirestoreError) => {
        this.errorCode = error?.code || 'UNKNOWN';
        this.isLoading = false;
      },
    });
  }


  private fetchRevelationsCount(): void {
    this.participants.forEach((participant) => {
      this.service
        .getRevelationCount(participant.revelationRef.id)
        .subscribe((count) => {
          participant.revealedCount = count;
        });
    });
  }

  private getParticipantUrl(participant: IParticipant): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/participant/${participant.id}`;
  }

  protected copyLinksUrl(): void {
    const url = window.location.href;
    this.clipboard.copy(url);
    const message = this.translate.instant('MESSAGES.INFO_CLIPBOARD_SUCCESS');
    this.snackBar.open(message, '', { duration: 2000 });
  }
  
  protected lockSuggestions(): void {
    const dialogData = new ConfirmDialogModel("LABELS.CLOSE_SUGGESTIONS", "MESSAGES.INFO_LOCK_SUGGESTION_CONFIRMATION");
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      this.isLoading = true;
      if(dialogResult === true && this.secretSantaId) {
        this.service.lockSuggestions(this.secretSantaId).subscribe(() => {
          this.fetchData(this.secretSantaId!);
        });
      }
    });
  }
  
  protected copyParticipantToClipboard(participant: IParticipant): void {
    this.clipboard.copy(this.getParticipantUrl(participant));
    const message = this.translate.instant('MESSAGES.INFO_CLIPBOARD_SUCCESS');
    this.snackBar.open(message, '', { duration: 2000 });
  }

  public participantHasSuggested(participant: IParticipant): boolean {
    return Array.isArray(participant.suggestions);
  }

  public shareSanta(participant: IParticipant): void {
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
}
