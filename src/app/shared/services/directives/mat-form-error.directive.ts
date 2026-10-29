import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroupDirective } from '@angular/forms';
import { extractTouchedChanges } from '@shared/util/extract-touch-changes';

@Directive({
  selector: 'mat-error[formError]',
})
export class MatFormErrorDirective implements OnInit {
  public readonly for = input.required<string>();
  public readonly error = input.required<string>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly formGroupDirective = inject(FormGroupDirective);
  private readonly destroyRef = inject(DestroyRef);

  private control?: AbstractControl;

  ngOnInit(): void {
    this.control = this.formGroupDirective.form.get(this.for()) ?? undefined;
    if (!this.control) return;

    extractTouchedChanges(this.control)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateErrorVisibility());
    this.control.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateErrorVisibility());

    this.updateErrorVisibility();
  }

  private updateErrorVisibility(): void {
    const visible =
      !!this.control?.touched && this.control.hasError(this.error());
    this.renderer.setStyle(
      this.el.nativeElement,
      'display',
      visible ? 'block' : 'none'
    );
  }
}
