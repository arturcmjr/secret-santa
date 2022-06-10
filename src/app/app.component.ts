import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'secret-santa';

  constructor(translate: TranslateService) {
    const defaultLang = 'en';
    translate.setDefaultLang(defaultLang);

    const lang = translate.getBrowserLang() || defaultLang;
    translate.use(lang);
  }
}
