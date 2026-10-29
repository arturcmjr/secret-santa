import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  input,
  signal,
  computed,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LucidePlus, LucideTrash } from '@lucide/angular';

@Component({
  selector: 'app-list-input',
  imports: [ReactiveFormsModule, TranslatePipe, LucidePlus, LucideTrash],
  templateUrl: './list-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ListInputComponent),
      multi: true,
    },
  ],
})
export class ListInputComponent implements ControlValueAccessor {
  public readonly label = input<string>('');
  public readonly minLength = input<number>();
  public readonly hideNew = input(false);

  protected readonly value = signal<string[]>([]);
  protected readonly inputControl = new FormControl('');
  protected readonly inputId = computed(
    () => `list-input-${this.label().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  );

  private onChange?: (value: string[]) => void;
  private onTouched?: () => void;

  constructor() {
    effect(() => {
      const minLength = this.minLength();
      this.inputControl.setValidators(
        minLength === undefined ? null : Validators.minLength(minLength)
      );
      this.inputControl.updateValueAndValidity();
    });
  }

  protected addItem(): void {
    if (this.hideNew()) return;

    const newItem = this.inputControl.value;
    if (this.inputControl.invalid || !newItem) {
      this.inputControl.markAsTouched();
      return;
    }
    if (this.value().includes(newItem)) {
      this.inputControl.setErrors({ duplicate: true });
      this.inputControl.markAsTouched();
      return;
    }
    this.inputControl.reset();
    this.value.update((items) => [...items, newItem]);
    this.onChange?.(this.value());
    this.onTouched?.();
  }

  protected removeItem(index: number): void {
    this.value.update((items) => items.filter((_, i) => i !== index));
    this.onChange?.(this.value());
    this.onTouched?.();
  }

  writeValue(value: string[] | null): void {
    this.value.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
