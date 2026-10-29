import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideMoon, LucideSun } from '@lucide/angular';
import { ThemeService } from '@shared/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [LucideMoon, LucideSun],
  template: `
    <button
      class="btn btn-ghost btn-circle"
      type="button"
      [attr.aria-label]="
        themeService.theme() === 'secret-santa-dark'
          ? 'Switch to light theme'
          : 'Switch to dark theme'
      "
      (click)="themeService.toggle()"
    >
      @if (themeService.theme() === 'secret-santa-dark') {
        <svg lucideSun class="size-5"></svg>
      } @else {
        <svg lucideMoon class="size-5"></svg>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);
}
