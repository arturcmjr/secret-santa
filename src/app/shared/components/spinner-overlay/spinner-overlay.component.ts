import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-spinner-overlay',
  imports: [TranslatePipe],
  templateUrl: './spinner-overlay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerOverlayComponent {
  protected readonly isLoading = inject(LoadingService).isLoading;
}
