import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SpinnerOverlayComponent } from '@shared/components/spinner-overlay/spinner-overlay.component';
import {
  IParticipant,
  IRevelation,
  SecretSantaTypeEnum,
} from '@shared/services/secret-santa/secret-santa.interface';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';

@Component({
  selector: 'app-reveal',
  imports: [TranslatePipe, SpinnerOverlayComponent],
  templateUrl: './reveal.component.html',
  styleUrl: './reveal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevealComponent {
  public readonly participant = input.required<IParticipant>();
  public readonly type = input.required<SecretSantaTypeEnum>();
  public readonly secretSantaId = input.required<string>();

  private readonly secretSanta = inject(SecretSantaService);

  protected readonly isLoading = signal(false);
  protected readonly revelation = signal<IRevelation | undefined>(undefined);
  protected readonly suggestions = signal<string[] | undefined>(undefined);
  protected readonly SecretSantaTypeEnum = SecretSantaTypeEnum;

  protected revealSecretSanta(): void {
    this.isLoading.set(true);
    this.secretSanta
      .revealSecretSanta(this.participant())
      .subscribe((revelation) => {
        this.secretSanta
          .getRevelationSuggestions(this.secretSantaId(), revelation.name)
          .subscribe((suggestions) => {
            this.suggestions.set(suggestions);
            this.isLoading.set(false);
          });
        this.revelation.set(revelation);
      });
  }
}
