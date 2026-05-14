import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <section class="section-pad py-6 lg:py-8">
      <div class="mx-auto grid max-w-7xl items-start gap-6 md:grid-cols-[15.5rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside class="panel order-1 h-fit p-3 md:sticky md:top-28 md:p-4">
          <div class="rounded-xl bg-velvet px-4 py-5 text-white">
            <p class="text-xs font-black uppercase tracking-[0.28em] text-champagne">Admin</p>
            <p class="mt-2 truncate text-lg font-black">{{ auth.user()?.name || 'Veloura Admin' }}</p>
            <p class="mt-1 text-xs font-semibold text-purple-100">Store operations</p>
          </div>

          <nav class="mt-4 grid gap-2 text-sm font-bold">
            <a routerLink="/admin" routerLinkActive="bg-purple-50 text-royal dark:bg-white/8" [routerLinkActiveOptions]="{exact: true}" class="rounded-xl px-3 py-3 transition hover:bg-purple-50 dark:hover:bg-white/5">Dashboard</a>
            <a routerLink="/admin/products" routerLinkActive="bg-purple-50 text-royal dark:bg-white/8" class="rounded-xl px-3 py-3 transition hover:bg-purple-50 dark:hover:bg-white/5">Products</a>
            <a routerLink="/admin/orders" routerLinkActive="bg-purple-50 text-royal dark:bg-white/8" class="rounded-xl px-3 py-3 transition hover:bg-purple-50 dark:hover:bg-white/5">Orders</a>
            <a routerLink="/admin/users" routerLinkActive="bg-purple-50 text-royal dark:bg-white/8" class="rounded-xl px-3 py-3 transition hover:bg-purple-50 dark:hover:bg-white/5">Users</a>
          </nav>
        </aside>

        <main class="order-2 min-w-0">
          <router-outlet />
        </main>
      </div>
    </section>
  `
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
}

