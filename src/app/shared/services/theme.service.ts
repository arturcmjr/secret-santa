import { Injectable, signal } from '@angular/core';

type ThemeName = 'secret-santa-light' | 'secret-santa-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'secret-santa-theme';
  readonly theme = signal<ThemeName>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle(): void {
    const theme =
      this.theme() === 'secret-santa-light'
        ? 'secret-santa-dark'
        : 'secret-santa-light';
    this.theme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.storageKey, theme);
  }

  private getInitialTheme(): ThemeName {
    const storedTheme = localStorage.getItem(this.storageKey);
    if (storedTheme === 'secret-santa-light' || storedTheme === 'secret-santa-dark') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'secret-santa-dark'
      : 'secret-santa-light';
  }

  private applyTheme(theme: ThemeName): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
