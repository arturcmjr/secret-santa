import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-error-illustration',
  imports: [TranslatePipe],
  templateUrl: './error-illustration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorIllustrationComponent {
  public readonly errorCode = input<string | null | undefined>(null);
}
