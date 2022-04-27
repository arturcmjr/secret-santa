import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function minimumArrayLength(length: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: any[] = control.value;

    if (!value) {
      return null;
    }

    return value.length < length ? { minimumArrayLength: true } : null;
  };
}
