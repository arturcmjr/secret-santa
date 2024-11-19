import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantComponent } from './participant.component';
import { SharedModule } from '@shared/shared.module';
import { SuggestionsComponent } from './components/suggestions/suggestions.component';

@NgModule({
  declarations: [ParticipantComponent, SuggestionsComponent],
  imports: [CommonModule, SharedModule],
})
export class ParticipantModule {}
