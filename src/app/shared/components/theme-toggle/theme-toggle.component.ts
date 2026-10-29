import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '@shared/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
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
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5">
          <circle cx="12" cy="12" r="4" />
          <path stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      } @else {
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" />
        </svg>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);
}
