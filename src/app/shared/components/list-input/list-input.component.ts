import { Component, Input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-list-input',
  templateUrl: './list-input.component.html',
  styleUrl: './list-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ListInputComponent,
      multi: true,
    },
  ],
})
export class ListInputComponent implements ControlValueAccessor {
  @Input()
  label: string;

  @Input("minLength")
  set minLengthInput(value: number) {
    this.minLength = value;
    this.inputControl.setValidators(Validators.minLength(value));
  }

  @Input()
  hideNew: boolean = false;

  protected minLength?: number;
  protected value: string[] = [];
  protected onChange: (value: string[]) => void;
  protected onTouched: () => void;
  protected inputControl = new FormControl('');
  protected addItem(): void {
    if (this.hideNew) return;

    if (this.inputControl.invalid || !this.inputControl.value) {
      this.inputControl.markAsTouched();
      return;
    }
    const newItem = this.inputControl.value;
    if (this.value.includes(newItem)) {
      this.inputControl.setErrors({ duplicate: true });
      this.inputControl.markAsTouched();
      return;
    } else {
      this.inputControl.setErrors({ duplicate: false });
    }
    this.inputControl.reset();
    this.value.push(newItem);
    this.onChange?.(this.value);
  }

  protected removeItem(index: number): void {
    this.value.splice(index, 1);
    this.onChange?.(this.value);
  }

  writeValue(value: string[]): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // do nothing
  }
}
