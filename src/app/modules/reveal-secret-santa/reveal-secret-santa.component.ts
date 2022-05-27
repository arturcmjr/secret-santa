import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { IParticipant, IRevelation, ISecretSanta } from '@shared/services/secret-santa/secret-santa.interface';
import {
  SecretSantaService,
} from '@shared/services/secret-santa/secret-santa.service';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private secretSanta: SecretSantaService,
    private titleService: Title,
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
      this.title = `${participant.name}'s Secret Santa`;
      this.titleService.setTitle(this.title);
      this.fetchSecretSanta();
    });
  }

  private fetchSecretSanta(): void {
    this.secretSanta.getSecretSanta(this.participant).subscribe((secretSanta) => {
      this.secretSantaInfo = secretSanta;
      this.subTitle = secretSanta.name;
      if(secretSanta.description) this.subTitle += ` - ${secretSanta.description}`;
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
