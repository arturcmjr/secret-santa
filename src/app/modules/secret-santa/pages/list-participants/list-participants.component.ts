import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env';
import { Clipboard } from '@angular/cdk/clipboard';
import {
  SecretSantaService,
} from '@shared/services/secret-santa/secret-santa.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IParticipant } from '@shared/services/secret-santa/secret-santa.interface';

@Component({
  selector: 'app-list-participants',
  templateUrl: './list-participants.component.html',
  styleUrls: ['./list-participants.component.scss'],
})
export class ListParticipantsComponent implements OnInit {
  public participants: IParticipant[] = [];
  public isLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private secretSanta: SecretSantaService,
    private domSanitizer: DomSanitizer,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const { secretSantaId } = params || {};
      if (secretSantaId) this.fetchParticipants(secretSantaId);
      // TODO: handle error
    });
  }

  private fetchParticipants(secretSantaId: string): void {
    this.isLoading = true;
    this.secretSanta
      .getParticipants(secretSantaId)
      .subscribe((participants) => {
        this.participants = participants;
        this.isLoading = false;
      });
    // TODO: handle error
  }

  public getParticipantUrl(participant: IParticipant): string {
    return `${environment.appUrl}reveal/${participant.id}`;
  }

  public copyToClipboard(participant: IParticipant): void { 
    this.clipboard.copy(this.getParticipantUrl(participant));
    this.snackBar.open('Link copied to clipboard', '', { duration: 2000 });
  }

  public shareSanta(participant: IParticipant): void {
    if (navigator.share) {
      navigator
        .share({
          title: `Reveal ${participant.name}'s secret santa`,
          url: this.getParticipantUrl(participant),
        })
        .then(() => {
          console.log('Compartilhado com sucesso!');
        })
        .catch(console.error);
    } else {
      this.copyToClipboard(participant);
    }
  }
}
