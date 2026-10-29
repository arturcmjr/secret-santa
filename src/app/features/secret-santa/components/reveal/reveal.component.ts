import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  IParticipant,
  IRevelation,
  SecretSantaTypeEnum,
} from '@features/secret-santa/models/secret-santa.interface';
import { SecretSantaService } from '@features/secret-santa/services/secret-santa.service';

@Component({
  selector: 'app-reveal',
  imports: [TranslatePipe],
  templateUrl: './reveal.component.html',
  styleUrl: './reveal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevealComponent {
  public readonly participant = input.required<IParticipant>();
  public readonly type = input.required<SecretSantaTypeEnum>();
  public readonly secretSantaId = input.required<string>();

  private readonly secretSanta = inject(SecretSantaService);

  protected readonly revelation = signal<IRevelation | undefined>(undefined);
  protected readonly suggestions = signal<string[] | undefined>(undefined);
  protected readonly SecretSantaTypeEnum = SecretSantaTypeEnum;

  protected revealSecretSanta(): void {
    this.secretSanta
      .revealSecretSanta(this.participant())
      .subscribe((revelation) => {
        this.secretSanta
          .getRevelationSuggestions(this.secretSantaId(), revelation.name)
          .subscribe((suggestions) => {
            this.suggestions.set(suggestions);
          });
        this.revelation.set(revelation);
      });
  }
}
