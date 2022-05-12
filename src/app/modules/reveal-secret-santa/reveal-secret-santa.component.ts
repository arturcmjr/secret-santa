import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IParticipant,
  IRevelation,
  ISecretSanta,
  SecretSantaService,
} from '@shared/services/secret-santa.service';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private secretSanta: SecretSantaService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const { participantId } = params || {};
      if (participantId) this.fetchParticipant(participantId);
    });
  }

  private fetchParticipant(participantId: string): void {
    this.isLoading = true;
    this.secretSanta.getParticipant(participantId).subscribe((participant) => {
      this.participant = participant;
      this.fetchSecretSanta();
    });
  }

  private fetchSecretSanta(): void {
    this.secretSanta.getSecretSanta(this.participant).subscribe((secretSanta) => {
      this.secretSantaInfo = secretSanta;
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
