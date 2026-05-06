import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <section class="section-pad py-8">
      <div class="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[16rem_1fr]">
        <aside class="panel h-fit p-4 lg:sticky lg:top-28">
          <p class="px-3 text-xs font-black uppercase tracking-[0.34em] text-royal">Admin</p>
          <p class="mt-2 px-3 text-lg font-black">{{ auth.user()?.name }}</p>
          <nav class="mt-6 grid gap-2 text-sm font-bold">
            <a routerLink="/admin" routerLinkActive="bg-purple-50 text-royal dark:bg-white/8" [routerLinkActiveOptions]="{exact: true}" class="rounded-xl px-3 py-3 transition hover:bg-purple-50 dark:hover:bg-white/5">Dashboard</a>
            <a routerLink="/admin/products" routerLinkActive="bg-purple-50 text-royal dark:bg-white/8" class="rounded-xl px-3 py-3 transition hover:bg-purple-50 dark:hover:bg-white/5">Products</a>
            <a routerLink="/admin/orders" routerLinkActive="bg-purple-50 text-royal dark:bg-white/8" class="rounded-xl px-3 py-3 transition hover:bg-purple-50 dark:hover:bg-white/5">Orders</a>
            <a routerLink="/admin/users" routerLinkActive="bg-purple-50 text-royal dark:bg-white/8" class="rounded-xl px-3 py-3 transition hover:bg-purple-50 dark:hover:bg-white/5">Users</a>
          </nav>
        </aside>
        <router-outlet />
      </div>
    </section>
  `
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
}

