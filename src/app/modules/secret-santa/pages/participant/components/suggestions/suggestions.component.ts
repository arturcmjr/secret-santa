import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ListInputComponent } from '@shared/components/list-input/list-input.component';
import { SpinnerOverlayComponent } from '@shared/components/spinner-overlay/spinner-overlay.component';
import { minimumArrayLength } from '@shared/helpers/validators/minimum-array-length.validator';
import { NotificationService } from '@shared/services/notification.service';
import { SecretSantaService } from '@shared/services/secret-santa/secret-santa.service';

@Component({
  selector: 'app-suggestions',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ListInputComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './suggestions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestionsComponent {
  public readonly participantId = input.required<string>();
  public readonly maxSuggestions = input.required<number>();
  public readonly suggestions = input<string[]>();

  private readonly ssService = inject(SecretSantaService);
  private readonly notification = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  protected readonly suggestionsControl = new FormControl<string[]>([]);
  protected readonly storedSuggestions = signal<string[] | undefined>(undefined);
  protected readonly isLoading = signal(false);

  private readonly currentSuggestions = toSignal(
    this.suggestionsControl.valueChanges,
    { initialValue: this.suggestionsControl.value }
  );
  protected readonly suggestionsCount = computed(
    () => this.currentSuggestions()?.length ?? 0
  );
  protected readonly hasChanges = computed(() => {
    const stored = this.storedSuggestions();
    if (!stored) return true;
    return JSON.stringify(this.currentSuggestions() ?? []) !== JSON.stringify(stored);
  });

  constructor() {
    effect(() => {
      const value = this.suggestions();
      this.storedSuggestions.set(value ? [...value] : undefined);
      if (value) this.suggestionsControl.setValue([...value]);
    });
    effect(() => {
      this.suggestionsControl.setValidators([
        minimumArrayLength(this.maxSuggestions()),
      ]);
      this.suggestionsControl.updateValueAndValidity();
    });
  }

  protected save(): void {
    this.isLoading.set(true);
    const suggestions = this.suggestionsControl.value || [];
    this.ssService
      .setParticipantSuggestions(this.participantId(), suggestions)
      .subscribe(() => {
        this.storedSuggestions.set([...suggestions]);
        this.isLoading.set(false);
        this.notification.show(
          this.translate.instant('MESSAGES.INFO_SUGGESTIONS_SAVED'),
          'success'
        );
      });
  }
}
