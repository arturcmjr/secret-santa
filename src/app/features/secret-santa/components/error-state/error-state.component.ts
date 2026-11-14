import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideServerCrash, LucideShieldAlert } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-error-state',
  imports: [TranslatePipe, LucideServerCrash, LucideShieldAlert],
  templateUrl: './error-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  public readonly errorCode = input<string | null | undefined>(null);
}
