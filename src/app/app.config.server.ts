import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideTranslateLoader, TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { of } from 'rxjs';

import en from '../assets/i18n/en.json';
import pt from '../assets/i18n/pt.json';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const translations: Record<string, TranslationObject> = { en, pt } as Record<string, TranslationObject>;

// Translations are bundled on the server to avoid HTTP round trips while rendering
class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of(translations[lang] ?? {});
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideTranslateLoader(() => new ServerTranslateLoader()),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
export { config as serverConfig };
