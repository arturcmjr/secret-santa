import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '@core/services/seo.service';
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
    inject(SeoService).init();
    const translate = inject(TranslateService);
    const defaultLang = 'en';
    translate.setFallbackLang(defaultLang);
    translate.use('pt');
    //translate.use(translate.getBrowserLang() || defaultLang);
  }
}
