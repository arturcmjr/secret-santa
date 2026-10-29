import { Directive, HostBinding, Input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

@Directive({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
})
export class ButtonDirective {
  @Input() public appButton: ButtonVariant | '' = 'primary';

  @HostBinding('class.ui-button')
  protected readonly buttonClass = true;

  @HostBinding('class.ui-button-primary')
  protected get primaryClass(): boolean {
    return this.appButton === '' || this.appButton === 'primary';
  }

  @HostBinding('class.ui-button-secondary')
  protected get secondaryClass(): boolean {
    return this.appButton === 'secondary';
  }

  @HostBinding('class.ui-button-quiet')
  protected get quietClass(): boolean {
    return this.appButton === 'quiet';
  }

  @HostBinding('class.ui-button-danger')
  protected get dangerClass(): boolean {
    return this.appButton === 'danger';
  }
}
