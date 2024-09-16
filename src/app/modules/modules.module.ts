import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './home/pages/home/home.component';
import { CreateSecretSantaComponent } from './secret-santa/pages/create-secret-santa/create-secret-santa.component';
import { RevealSecretSantaComponent } from './secret-santa/pages/reveal-secret-santa/reveal-secret-santa.component';
import { ListParticipantsComponent } from './secret-santa/pages/list-participants/list-participants.component';
import { ErrorIllustrationComponent } from './secret-santa/components/error-illustration/error-illustration.component';

@NgModule({
  declarations: [
    HomeComponent,
    CreateSecretSantaComponent,
    RevealSecretSantaComponent,
    ListParticipantsComponent,
    ErrorIllustrationComponent,
  ],
  imports: [CommonModule, SharedModule],
})
export class ModulesModule {}
