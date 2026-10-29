import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-list-input',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatError,
    MatIcon,
    MatInput,
    TranslatePipe,
  ],
  templateUrl: './list-input.component.html',
  styleUrl: './list-input.component.scss',
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
