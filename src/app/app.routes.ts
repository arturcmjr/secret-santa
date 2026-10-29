import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./modules/home/pages/home/home.component').then(
        (m) => m.HomeComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import(
        './modules/secret-santa/pages/create-secret-santa/create-secret-santa.component'
      ).then((m) => m.CreateSecretSantaComponent),
  },
  {
    path: 'share/:secretSantaId',
    loadComponent: () =>
      import(
        './modules/secret-santa/pages/list-participants/list-participants.component'
      ).then((m) => m.ListParticipantsComponent),
  },
  {
    path: 'participant/:participantId',
    loadComponent: () =>
      import(
        './modules/secret-santa/pages/participant/participant.component'
      ).then((m) => m.ParticipantComponent),
  },
];
