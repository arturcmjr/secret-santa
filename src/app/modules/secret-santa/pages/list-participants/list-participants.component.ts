import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env';
import { Clipboard } from '@angular/cdk/clipboard';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IParticipant } from '@shared/services/secret-santa/secret-santa.interface';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { FirestoreError } from '@firebase/firestore';

@Component({
  selector: 'app-list-participants',
  templateUrl: './list-participants.component.html',
  styleUrls: ['./list-participants.component.scss'],
})
export class ListParticipantsComponent implements OnInit {
  public participants: IParticipant[] = [];
  public isLoading = false;
  public title: string;
  public errorCode: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private secretSanta: SecretSantaService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const { secretSantaId } = params || {};
      if (secretSantaId) this.fetchData(secretSantaId);
    });
  }

  private fetchData(secretSantaId: string): void {
    this.isLoading = true;
    const participants$ = this.secretSanta.getParticipants(secretSantaId);
    const secretSanta$ = this.secretSanta.getSecretSanta(secretSantaId);

    combineLatest([participants$, secretSanta$]).subscribe({
      next: ([participants, secretSanta]) => {
        this.participants = participants;
        const title = this.translate.instant('PARTICIPANTS.TITLE', {
          name: secretSanta.name,
        });
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

  public getParticipantUrl(participant: IParticipant): string {
    return `${environment.appUrl}reveal/${participant.id}`;
  }

  public copyToClipboard(participant: IParticipant): void {
    this.clipboard.copy(this.getParticipantUrl(participant));
    const message = this.translate.instant('PARTICIPANTS.CLIPBOARD_SUCCESS');
    this.snackBar.open(message, '', { duration: 2000 });
  }

  public shareSanta(participant: IParticipant): void {
    if (navigator.share) {
      const title: string = this.translate.instant('PARTICIPANTS.SHARE_TITLE', {
        name: participant.name,
      });
      navigator.share({
        title,
        url: this.getParticipantUrl(participant),
      });
    } else {
      this.copyToClipboard(participant);
    }
  }
}
