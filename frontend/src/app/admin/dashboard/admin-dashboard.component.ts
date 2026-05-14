import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService, SalesStats } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `
    <div class="min-w-0">
      <div class="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Sales stats</p>
          <h1 class="mt-2 text-3xl font-black text-ink dark:text-white sm:text-4xl">Commerce dashboard</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Track revenue, order flow, product demand, and customer growth from one operational view.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <a routerLink="/admin/products" class="btn-secondary px-4 py-2">Manage products</a>
          <a routerLink="/admin/orders" class="btn-primary px-4 py-2">Review orders</a>
        </div>
      </div>

      @if (stats(); as data) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article class="panel p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-slate-500">Revenue</p>
                <p class="mt-2 text-2xl font-black text-ink dark:text-white">{{ data.revenue | currency }}</p>
              </div>
              <span class="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-royal dark:bg-white/8">Live</span>
            </div>
            <p class="mt-4 text-xs font-semibold text-slate-500">Total non-cancelled order value</p>
          </article>

          <article class="panel p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-slate-500">Orders</p>
                <p class="mt-2 text-2xl font-black text-ink dark:text-white">{{ data.orders }}</p>
              </div>
              <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Flow</span>
            </div>
            <p class="mt-4 text-xs font-semibold text-slate-500">{{ data.orders === 1 ? 'Order' : 'Orders' }} captured in the store</p>
          </article>

          <article class="panel p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-slate-500">Average order</p>
                <p class="mt-2 text-2xl font-black text-ink dark:text-white">{{ data.averageOrderValue | currency }}</p>
              </div>
              <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">AOV</span>
            </div>
            <p class="mt-4 text-xs font-semibold text-slate-500">Useful for bundle and coupon decisions</p>
          </article>

          <article class="panel p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-slate-500">Customers</p>
                <p class="mt-2 text-2xl font-black text-ink dark:text-white">{{ data.userCount }}</p>
              </div>
              <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">CRM</span>
            </div>
            <p class="mt-4 text-xs font-semibold text-slate-500">{{ data.productCount }} published products</p>
          </article>
        </div>

        <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)]">
          <section class="panel min-w-0 p-5 sm:p-6">
            <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 class="text-xl font-black text-ink dark:text-white">Sales trend</h2>
                <p class="mt-1 text-sm text-slate-500">Revenue and order count by day</p>
              </div>
              <span class="w-fit rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-royal dark:bg-white/8">
                {{ data.byDay.length || 0 }} days
              </span>
            </div>

            <div class="mt-6 grid gap-4">
              @for (day of data.byDay; track day._id) {
                <div class="grid grid-cols-[5.5rem_minmax(0,1fr)_4.75rem] items-center gap-3 text-sm sm:grid-cols-[6.5rem_minmax(0,1fr)_6rem]">
                  <span class="truncate font-bold text-slate-500">{{ day._id }}</span>
                  <div class="h-4 overflow-hidden rounded-full bg-purple-50 dark:bg-white/8">
                    <div class="h-full rounded-full bg-royal transition-all" [style.width.%]="barWidth(day.revenue, data)"></div>
                  </div>
                  <div class="text-right">
                    <strong class="block text-xs sm:text-sm">{{ day.revenue | currency }}</strong>
                    <span class="text-xs text-slate-500">{{ day.orders }} orders</span>
                  </div>
                </div>
              } @empty {
                <div class="rounded-xl bg-purple-50 p-5 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  Sales will appear here after customers place orders.
                </div>
              }
            </div>
          </section>

          <section class="panel min-w-0 p-5 sm:p-6">
            <h2 class="text-xl font-black text-ink dark:text-white">Operations</h2>
            <div class="mt-5 grid gap-3">
              <div class="rounded-xl bg-purple-50 p-4 dark:bg-white/5">
                <p class="text-xs font-black uppercase tracking-[0.22em] text-royal">Catalog</p>
                <p class="mt-2 text-2xl font-black">{{ data.productCount }}</p>
                <p class="text-sm text-slate-500">Published products</p>
              </div>
              <div class="rounded-xl bg-purple-50 p-4 dark:bg-white/5">
                <p class="text-xs font-black uppercase tracking-[0.22em] text-royal">Conversion</p>
                <p class="mt-2 text-2xl font-black">{{ conversionSignal(data) }}</p>
                <p class="text-sm text-slate-500">Orders per catalog size</p>
              </div>
              <div class="rounded-xl bg-purple-50 p-4 dark:bg-white/5">
                <p class="text-xs font-black uppercase tracking-[0.22em] text-royal">Next action</p>
                <p class="mt-2 text-sm font-bold leading-6">{{ nextAction(data) }}</p>
              </div>
            </div>
          </section>
        </div>

        <section class="panel mt-6 p-5 sm:p-6">
          <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 class="text-xl font-black text-ink dark:text-white">Top products</h2>
              <p class="mt-1 text-sm text-slate-500">Ranked by orders, views, and catalog momentum</p>
            </div>
            <a routerLink="/admin/products" class="text-sm font-black text-royal">Open catalog</a>
          </div>

          <div class="mt-5 grid gap-3">
            @for (product of data.topProducts; track product._id) {
              <article class="grid gap-4 rounded-xl bg-purple-50 p-3 dark:bg-white/5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div class="flex min-w-0 items-center gap-3">
                  <img class="h-16 w-12 shrink-0 object-cover" [src]="product.images[0]?.url" [alt]="product.name">
                  <div class="min-w-0">
                    <p class="truncate font-black text-ink dark:text-white">{{ product.name }}</p>
                    <p class="mt-1 text-sm text-slate-500">{{ product.orderCount }} ordered / {{ product.viewCount }} views</p>
                  </div>
                </div>
                <div class="flex items-center justify-between gap-4 sm:block sm:text-right">
                  <strong>{{ product.price | currency }}</strong>
                  <p class="text-xs font-bold text-slate-500">{{ product.category }}</p>
                </div>
              </article>
            } @empty {
              <div class="rounded-xl bg-purple-50 p-5 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                Product performance will appear after views or orders are recorded.
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

  conversionSignal(data: SalesStats) {
    if (!data.productCount) return '0%';
    return `${Math.round((data.orders / data.productCount) * 100)}%`;
  }

  nextAction(data: SalesStats) {
    if (!data.orders) return 'Drive the first order with a launch coupon and featured products.';
    if (!data.topProducts.length) return 'Promote best sellers after a few more product views.';
    if (data.averageOrderValue < 120) return 'Use bundles and free-shipping thresholds to lift average order value.';
    return 'Keep monitoring top products and restock winners before inventory gets tight.';
  }
}

