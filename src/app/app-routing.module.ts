import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RevealSecretSantaComponent } from '@modules/secret-santa/pages/reveal-secret-santa/reveal-secret-santa.component';
import { ListParticipantsComponent } from '@modules/secret-santa/pages/list-participants/list-participants.component';
import { HomeComponent } from './modules/home/pages/home/home.component';
import { CreateSecretSantaComponent } from './modules/secret-santa/pages/create-secret-santa/create-secret-santa.component';
import { SuggestionsComponent } from '@modules/secret-santa/pages/suggestions/suggestions.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: HomeComponent },
      { path: 'create', component: CreateSecretSantaComponent },
      { path: 'reveal/:participantId', component: RevealSecretSantaComponent },
      { path: 'share/:secretSantaId', component: ListParticipantsComponent },
      { path: 'suggestions/:participantId', component: SuggestionsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
