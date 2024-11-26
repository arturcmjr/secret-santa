import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { minimumArrayLength } from '@shared/helpers/validators/minimum-array-length.validator';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrl: './suggestions.component.scss',
})
export class SuggestionsComponent implements OnInit, OnDestroy {
  @Input()
  maxSuggestions: number;

  @Input('suggestions')
  set storedSuggestionInput(value: string[] | undefined) {
    this.storedSuggestions = value ? [...value] : undefined;
    if (value) this.suggestionsControl.setValue(value);
    this.checkForChanges();
  }

  protected get suggestionsCount(): number {
    return this.suggestionsControl.value?.length ?? 0;
  }
  protected suggestionsControl = new FormControl<string[]>([]);
  protected storedSuggestions?: string[] = [];
  private subs = new Subscription();
  protected hasChanges = false;
  protected participantId: string;
  protected isLoading = false;

  constructor(
    private ssService: SecretSantaService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private translate: TranslateService
  ) {
    this.activatedRoute.params.subscribe((params) => {
      const { participantId } = params || {};
      this.participantId = participantId;
    });
  }

  private checkForChanges(): void {
    const current = this.suggestionsControl.value || [];
    if (!this.storedSuggestions) {
      this.hasChanges = true;
      return;
    }
    this.hasChanges =
      JSON.stringify(current) !== JSON.stringify(this.storedSuggestions);
  }

  protected save(): void {
    this.isLoading = true;
    const suggestions = this.suggestionsControl.value || [];
    this.ssService
      .setParticipantSuggestions(this.participantId, suggestions)
      .subscribe(() => {
        this.storedSuggestions = [...suggestions];
        this.hasChanges = false;
        this.isLoading = false;
        this.snack.open(
          this.translate.instant('MESSAGES.INFO_SUGGESTIONS_SAVED'),
          '',
          { duration: 2000 }
        );
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.subs.add(
      this.suggestionsControl.valueChanges.subscribe((value) => {
        this.checkForChanges();
      })
    );
    this.suggestionsControl.setValidators([
      minimumArrayLength(this.maxSuggestions),
    ]);
  }
}
