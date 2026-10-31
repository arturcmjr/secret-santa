import { Routes } from '@angular/router';
import { savedLinksRedirectGuard } from '@core/guards/saved-links-redirect.guard';
import { AppContainerComponent } from './layout/app-container/app-container.component';

export const routes: Routes = [
  {
    path: '',
    component: AppContainerComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: { hideFooter: true },
        canActivate: [savedLinksRedirectGuard],
        loadComponent: () =>
          import('./features/home/pages/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'start',
        data: { hideFooter: true },
        loadComponent: () =>
          import('./features/home/pages/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'my-secret-santas',
        loadComponent: () =>
          import(
            './features/dashboard/pages/dashboard/dashboard.component'
          ).then((m) => m.DashboardComponent),
      },
      {
        path: 'create',
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
