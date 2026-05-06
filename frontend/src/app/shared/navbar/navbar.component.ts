import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="fixed inset-x-0 top-0 z-40 border-b border-purple-100/70 bg-white/88 backdrop-blur-xl dark:border-white/10 dark:bg-[#100d16]/88">
      <div class="section-pad mx-auto flex h-20 max-w-7xl items-center justify-between gap-4">
        <a routerLink="/" class="flex items-center gap-3" aria-label="Veloura home">
          <span class="grid h-10 w-10 place-items-center rounded-2xl bg-velvet text-lg font-black text-orchid shadow-lg shadow-purple-950/20">V</span>
          <span class="hidden text-sm font-black uppercase tracking-[0.34em] text-velvet dark:text-white sm:block">Veloura</span>
        </a>

        <nav class="hidden items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
          <a routerLink="/shop" routerLinkActive="text-royal" class="transition hover:text-royal">Shop</a>
          <a routerLink="/shop" [queryParams]="{category: 'Women'}" class="transition hover:text-royal">Women</a>
          <a routerLink="/shop" [queryParams]="{category: 'Men'}" class="transition hover:text-royal">Men</a>
          <a routerLink="/shop" [queryParams]="{category: 'Accessories'}" class="transition hover:text-royal">Accessories</a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="text-royal" class="transition hover:text-royal">Admin</a>
          }
        </nav>

        <div class="flex items-center gap-2">
          <button type="button" class="grid h-10 w-10 place-items-center rounded-full border border-purple-100 bg-white text-lg transition hover:border-royal dark:border-white/10 dark:bg-white/5" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Use light mode' : 'Use dark mode'">
            @if (theme.isDark()) { ☾ } @else { ☼ }
          </button>

          <a routerLink="/cart" class="relative grid h-10 w-10 place-items-center rounded-full border border-purple-100 bg-white text-lg transition hover:border-royal dark:border-white/10 dark:bg-white/5" aria-label="Cart">
            <span>Bag</span>
            @if (cart.itemCount() > 0) {
              <span class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-champagne px-1 text-xs font-black text-ink">{{ cart.itemCount() }}</span>
            }
          </a>

          @if (auth.isAuthenticated()) {
            <a routerLink="/orders" class="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-purple-50 dark:text-slate-200 dark:hover:bg-white/5 sm:inline-flex">{{ auth.user()?.name || 'Account' }}</a>
            <button type="button" class="btn-secondary px-4 py-2" (click)="auth.logout()">Logout</button>
          } @else {
            <a routerLink="/login" class="btn-secondary px-4 py-2">Login</a>
          }
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly theme = inject(ThemeService);
}

