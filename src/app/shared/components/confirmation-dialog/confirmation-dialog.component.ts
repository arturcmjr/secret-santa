import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from '@shared/directives/button.directive';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [TranslatePipe, ButtonDirective],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  public readonly title = input.required<string>();
  public readonly message = input.required<string>();
  public readonly confirmed = output<void>();
  public readonly dismissed = output<void>();
}
