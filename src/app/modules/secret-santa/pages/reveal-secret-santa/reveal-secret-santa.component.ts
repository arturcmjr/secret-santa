import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FirestoreError } from '@firebase/firestore';
import { TranslateService } from '@ngx-translate/core';
import {
  IParticipant,
  IRevelation,
  ISecretSanta,
} from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';

@Component({
  selector: 'app-reveal-secret-santa',
  templateUrl: './reveal-secret-santa.component.html',
  styleUrls: ['./reveal-secret-santa.component.scss'],
})
export class RevealSecretSantaComponent implements OnInit {
  public participant: IParticipant;
  public secretSantaInfo: ISecretSanta;
  public revelation: IRevelation;
  public isLoading: boolean = false;
  public title: string;
  public subTitle: string;
  public errorCode: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private secretSanta: SecretSantaService,
    private titleService: Title,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const { participantId } = params || {};
      if (participantId) this.fetchParticipant(participantId);
    });
  }

  private fetchParticipant(participantId: string): void {
    this.isLoading = true;
    this.secretSanta.getParticipant(participantId).subscribe({
      next: (participant) => {
        this.participant = participant;
        this.translate
          .get('REVEAL.TITLE', { name: participant.name })
          .subscribe((res: string) => {
            this.title = res;
            this.titleService.setTitle(res);
          });
        this.fetchSecretSanta();
      },
      error: (error: FirestoreError) => {
        this.errorCode = error?.code || 'UNKNOWN';
        this.isLoading = false;
      },
    });
  }

  private fetchSecretSanta(): void {
    this.secretSanta
      .getSecretSanta(this.participant.secretSantaRef.id)
      .subscribe((secretSanta) => {
        this.secretSantaInfo = secretSanta;
        this.subTitle = secretSanta.name;
        if (secretSanta.description)
          this.subTitle += ` - ${secretSanta.description}`;
        this.isLoading = false;
      });
  }

  public revealSecretSanta(): void {
    this.isLoading = true;
    this.secretSanta
      .revealSecretSanta(this.participant)
      .subscribe((revelation) => {
        this.isLoading = false;
        this.revelation = revelation;
      });
  }
}
