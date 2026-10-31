import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '@core/services/theme.service';
import { ToastComponent } from '@shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor() {
    inject(ThemeService);
    const translate = inject(TranslateService);
    const defaultLang = 'en';
    translate.setFallbackLang(defaultLang);
    translate.use(translate.getBrowserLang() || defaultLang);
  }
}
