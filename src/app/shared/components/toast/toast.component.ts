import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-toast',
  template: `
    @if (notification.message(); as message) {
      <div class="toast toast-top toast-end z-[100] p-4">
        <div
          class="alert shadow-lg"
          [class.alert-success]="message.type === 'success'"
          [class.alert-error]="message.type === 'error'"
          [class.alert-info]="message.type === 'info'"
          role="status"
          aria-live="polite"
        >
          <span>{{ message.text }}</span>
          <button
            class="btn btn-ghost btn-xs btn-circle"
            type="button"
            aria-label="Dismiss notification"
            (click)="notification.dismiss()"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  protected readonly notification = inject(NotificationService);
}
