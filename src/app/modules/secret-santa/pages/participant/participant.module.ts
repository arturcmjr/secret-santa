import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantComponent } from './participant.component';
import { SharedModule } from '@shared/shared.module';
import { SuggestionsComponent } from './components/suggestions/suggestions.component';
import { RevealComponent } from './components/reveal/reveal.component';

@NgModule({
  declarations: [ParticipantComponent, SuggestionsComponent, RevealComponent],
  imports: [CommonModule, SharedModule],
})
export class ParticipantModule {}
