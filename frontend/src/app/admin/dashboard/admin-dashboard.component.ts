import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminService, SalesStats } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div>
      <div class="mb-6">
        <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Sales stats</p>
        <h1 class="mt-2 text-4xl font-black text-ink dark:text-white">Commerce dashboard</h1>
      </div>

      @if (stats(); as data) {
        <div class="grid gap-4 md:grid-cols-4">
          <div class="panel p-5"><p class="text-sm text-slate-500">Revenue</p><p class="mt-2 text-2xl font-black">{{ data.revenue | currency }}</p></div>
          <div class="panel p-5"><p class="text-sm text-slate-500">Orders</p><p class="mt-2 text-2xl font-black">{{ data.orders }}</p></div>
          <div class="panel p-5"><p class="text-sm text-slate-500">AOV</p><p class="mt-2 text-2xl font-black">{{ data.averageOrderValue | currency }}</p></div>
          <div class="panel p-5"><p class="text-sm text-slate-500">Users</p><p class="mt-2 text-2xl font-black">{{ data.userCount }}</p></div>
        </div>

        <section class="panel mt-6 p-6">
          <h2 class="text-xl font-black">Sales trend</h2>
          <div class="mt-6 grid gap-4">
            @for (day of data.byDay; track day._id) {
              <div class="grid grid-cols-[6rem_1fr_5rem] items-center gap-3 text-sm">
                <span class="font-bold text-slate-500">{{ day._id }}</span>
                <div class="h-3 overflow-hidden rounded-full bg-purple-50 dark:bg-white/8">
                  <div class="h-full rounded-full bg-royal" [style.width.%]="barWidth(day.revenue, data)"></div>
                </div>
                <strong class="text-right">{{ day.revenue | currency }}</strong>
              </div>
            } @empty {
              <p class="text-sm text-slate-500">Sales will appear here after orders are created.</p>
            }
          </div>
        </section>

        <section class="panel mt-6 p-6">
          <h2 class="text-xl font-black">Top products</h2>
          <div class="mt-5 grid gap-3">
            @for (product of data.topProducts; track product._id) {
              <div class="flex items-center justify-between rounded-xl bg-purple-50 p-3 dark:bg-white/5">
                <div class="flex items-center gap-3">
                  <img class="h-14 w-11 object-cover" [src]="product.images[0]?.url" [alt]="product.name">
                  <div>
                    <p class="font-bold">{{ product.name }}</p>
                    <p class="text-sm text-slate-500">{{ product.orderCount }} ordered · {{ product.viewCount }} views</p>
                  </div>
                </div>
                <strong>{{ product.price | currency }}</strong>
              </div>
            }
          </div>
        </section>
      } @else {
        <div class="skeleton h-96"></div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);
  readonly stats = signal<SalesStats | null>(null);

  ngOnInit() {
    this.admin.stats().subscribe((response) => this.stats.set(response));
  }

  barWidth(revenue: number, data: SalesStats) {
    const max = Math.max(...data.byDay.map((day) => day.revenue), 1);
    return Math.max(4, (revenue / max) * 100);
  }
}

