import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(localStorage.getItem('veloura_theme') === 'dark');

  constructor() {
    this.apply();
  }

  toggle() {
    this.isDark.update((value) => !value);
    localStorage.setItem('veloura_theme', this.isDark() ? 'dark' : 'light');
    this.apply();
  }

  private apply() {
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}

