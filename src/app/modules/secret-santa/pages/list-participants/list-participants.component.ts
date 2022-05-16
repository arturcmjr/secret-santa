import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env';
import {Clipboard} from '@angular/cdk/clipboard';
import {
  IParticipant,
  SecretSantaService,
} from '@shared/services/secret-santa.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list-participants',
  templateUrl: './list-participants.component.html',
  styleUrls: ['./list-participants.component.scss'],
})
export class ListParticipantsComponent implements OnInit {
  public participants: IParticipant[] = [];
  public wppUrls: SafeUrl[] = [];
  public shareUrls: SafeUrl[] = [];
  public isLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private secretSanta: SecretSantaService,
    private domSanitizer: DomSanitizer,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
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
        this.setUpWhatsAppLinks();
        this.setUpShareUrls();
        this.isLoading = false;
      });
    // TODO: handle error
  }

  private setUpWhatsAppLinks(): void {
    this.wppUrls = this.participants.map((participant) => {
      const text = `Hello ${participant.name}, click on the link to reveal your secret santa: ${this.getParticipantUrl(participant)}`;
      return this.domSanitizer.bypassSecurityTrustResourceUrl(
        `whatsapp://send?text=${encodeURI(text)}`
      );
    });
  }

  private setUpShareUrls(): void {
    this.shareUrls = this.participants.map((participant) => {
      return this.domSanitizer.bypassSecurityTrustResourceUrl(this.getParticipantUrl(participant));
    });
  }

  public getParticipantUrl(participant: IParticipant): string {
    return `${environment.appUrl}reveal/${participant.id}`;
  }

  public copyToClipboard(participant: IParticipant): void {
    this.clipboard.copy(this.getParticipantUrl(participant));
    this.snackBar.open('Copied to clipboard', '', { duration: 2000 });
  }
}
