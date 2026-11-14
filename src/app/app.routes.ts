import { Routes } from '@angular/router';
import { savedLinksRedirectGuard } from '@core/guards/saved-links-redirect.guard';
import { ISeoRouteData } from '@core/services/seo.service';
import { AppContainerComponent } from './layout/app-container/app-container.component';

const HOME_SEO: ISeoRouteData = {
  titleKey: 'SEO.HOME.TITLE',
  descriptionKey: 'SEO.HOME.DESCRIPTION',
  canonicalPath: '/',
};

export const routes: Routes = [
  {
    path: '',
    component: AppContainerComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: { hideFooter: true, seo: HOME_SEO },
        canActivate: [savedLinksRedirectGuard],
        loadComponent: () =>
          import('./features/home/pages/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'start',
        data: { hideFooter: true, seo: { ...HOME_SEO, canonicalPath: '/' } },
        loadComponent: () =>
          import('./features/home/pages/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'my-secret-santas',
        data: {
          seo: {
            titleKey: 'SEO.DASHBOARD.TITLE',
            descriptionKey: 'SEO.DASHBOARD.DESCRIPTION',
            noindex: true,
          },
        },
        loadComponent: () =>
          import(
            './features/dashboard/pages/dashboard/dashboard.component'
          ).then((m) => m.DashboardComponent),
      },
      {
        path: 'create',
        data: {
          seo: {
            titleKey: 'SEO.CREATE.TITLE',
            descriptionKey: 'SEO.CREATE.DESCRIPTION',
          },
        },
        loadComponent: () =>
          import(
            './features/secret-santa/pages/create-secret-santa/create-secret-santa.component'
          ).then((m) => m.CreateSecretSantaComponent),
      },
      {
        path: 'share/:secretSantaId',
        loadComponent: () =>
          import(
            './features/secret-santa/pages/list-participants/list-participants.component'
          ).then((m) => m.ListParticipantsComponent),
      },
      {
        path: 'participant/:participantId',
        loadComponent: () =>
          import(
            './features/secret-santa/pages/participant/participant.component'
          ).then((m) => m.ParticipantComponent),
      },
    ],
  },
];
