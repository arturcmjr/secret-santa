import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-notification-outlet',
  templateUrl: './notification-outlet.component.html',
  styleUrl: './notification-outlet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationOutletComponent {
  protected readonly notification = inject(NotificationService);
}
