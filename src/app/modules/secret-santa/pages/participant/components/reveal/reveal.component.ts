import { Component, Input } from '@angular/core';
import {
  IParticipant,
  IRevelation,
  SecretSantaTypeEnum,
} from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';

@Component({
  selector: 'app-reveal',
  templateUrl: './reveal.component.html',
  styleUrl: './reveal.component.scss',
})
export class RevealComponent {
  @Input()
  participant: IParticipant;

  @Input()
  type: SecretSantaTypeEnum;

  @Input()
  secretSantaId: string;

  protected isLoading: boolean = false;
  protected revelation: IRevelation;
  protected suggestions?: string[];
  protected readonly SecretSantaTypeEnum = SecretSantaTypeEnum;

  constructor(private secretSanta: SecretSantaService) {}

  protected revealSecretSanta(): void {
    this.isLoading = true;
    this.secretSanta
      .revealSecretSanta(this.participant)
      .subscribe((revelation) => {
        this.secretSanta.getRevelationSuggestions(this.secretSantaId, revelation.name).subscribe((suggestions) => {
          this.suggestions = suggestions;
          this.isLoading = false;
        });
        this.revelation = revelation;
      });
  }
}
