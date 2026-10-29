import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-spinner-overlay',
  imports: [TranslatePipe],
  templateUrl: './spinner-overlay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerOverlayComponent {
  public readonly isLoading = input<boolean>(false);
}
