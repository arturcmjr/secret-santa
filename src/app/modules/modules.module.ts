import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './home/pages/home/home.component';
import { CreateSecretSantaComponent } from './secret-santa/pages/create-secret-santa/create-secret-santa.component';

@NgModule({
  declarations: [HomeComponent, CreateSecretSantaComponent],
  imports: [CommonModule, SharedModule],
})
export class ModulesModule {}
