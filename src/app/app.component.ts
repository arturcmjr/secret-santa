import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotificationOutletComponent } from '@shared/components/notification-outlet/notification-outlet.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationOutletComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor() {
    const translate = inject(TranslateService);
    const defaultLang = 'en';
    translate.setFallbackLang(defaultLang);
    translate.use(translate.getBrowserLang() || defaultLang);
  }
}
