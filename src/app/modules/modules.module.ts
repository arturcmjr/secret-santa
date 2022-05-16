import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './home/pages/home/home.component';
import { CreateSecretSantaComponent } from './secret-santa/pages/create-secret-santa/create-secret-santa.component';
import { RevealSecretSantaComponent } from './reveal-secret-santa/reveal-secret-santa.component';
import { ListParticipantsComponent } from './secret-santa/pages/list-participants/list-participants.component';

@NgModule({
  declarations: [HomeComponent, CreateSecretSantaComponent, RevealSecretSantaComponent, ListParticipantsComponent],
  imports: [CommonModule, SharedModule],
})
export class ModulesModule {}
