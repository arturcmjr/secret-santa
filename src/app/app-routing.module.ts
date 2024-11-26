import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListParticipantsComponent } from '@modules/secret-santa/pages/list-participants/list-participants.component';
import { HomeComponent } from './modules/home/pages/home/home.component';
import { CreateSecretSantaComponent } from './modules/secret-santa/pages/create-secret-santa/create-secret-santa.component';
import { ParticipantComponent } from '@modules/secret-santa/pages/participant/participant.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: HomeComponent },
      { path: 'create', component: CreateSecretSantaComponent },
      { path: 'share/:secretSantaId', component: ListParticipantsComponent },
      { path: 'participant/:participantId', component: ParticipantComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
