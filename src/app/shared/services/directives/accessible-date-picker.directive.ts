import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';
import { DaisyDatePickerComponent } from 'ng-daisy-date-picker';
import { Subscription } from 'rxjs';

@Directive({
  selector: 'daisy-date-picker[accessibleDatePicker]',
  standalone: true,
})
export class AccessibleDatePickerDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly picker = inject(DaisyDatePickerComponent);
  private readonly renderer = inject(Renderer2);
  private trigger?: HTMLElement;
  private subscription?: Subscription;

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') {
      return;
    }
    event.preventDefault();
    this.picker.open();
  };

  ngAfterViewInit(): void {
    this.trigger =
      this.host.nativeElement.querySelector<HTMLElement>('[cdkOverlayOrigin]') ??
      undefined;
    if (!this.trigger) return;

    this.renderer.setAttribute(this.trigger, 'role', 'button');
    this.renderer.setAttribute(this.trigger, 'tabindex', '0');
    this.renderer.setAttribute(this.trigger, 'aria-haspopup', 'dialog');
    this.renderer.setAttribute(
      this.trigger,
      'aria-label',
      this.host.nativeElement.getAttribute('aria-label') ?? ''
    );
    this.renderer.setAttribute(this.trigger, 'aria-expanded', 'false');
    this.trigger.addEventListener('keydown', this.handleKeydown);
    this.subscription = this.picker.openChange.subscribe((isOpen) => {
      this.renderer.setAttribute(this.trigger!, 'aria-expanded', String(isOpen));
    });
  }

  ngOnDestroy(): void {
    this.trigger?.removeEventListener('keydown', this.handleKeydown);
    this.subscription?.unsubscribe();
  }
}
