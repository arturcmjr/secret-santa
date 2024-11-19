import {
  Directive,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { FormGroupDirective, AbstractControl } from '@angular/forms';
import { extractTouchedChanges } from '@shared/util/extract-touch-changes';
import { Subscription } from 'rxjs';

@Directive({
  selector: 'mat-error[formError]',
})
export class MatFormErrorDirective implements OnInit, OnDestroy {
  @Input() for: string;
  @Input() error: string;

  private control: AbstractControl;
  private subs = new Subscription();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private formGroupDirective: FormGroupDirective
  ) {}

  ngOnInit() {
    this.control = this.formGroupDirective.form.get(
      this.for
    ) as AbstractControl;

    if (this.control) {
      const touchedChanges$ = extractTouchedChanges(this.control);
      this.subs.add(
        touchedChanges$.subscribe(() => {
          this.updateErrorVisibility();
        })
      );
      this.subs.add(
        this.control.statusChanges.subscribe(() => {
          this.updateErrorVisibility();
        })
      );

      this.updateErrorVisibility();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private updateErrorVisibility() {
    if (this.control.touched && this.control.hasError(this.error)) {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }
}
