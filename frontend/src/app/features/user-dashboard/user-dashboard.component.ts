import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="section-pad py-10">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Dashboard</p>
            <h1 class="mt-2 text-4xl font-black text-ink dark:text-white">Orders for {{ auth.user()?.name || 'you' }}</h1>
          </div>
          <a routerLink="/shop" class="btn-primary">Shop again</a>
        </div>

        @if (!auth.isAuthenticated()) {
          <div class="panel p-6">
            <h2 class="text-xl font-black">Login to view orders</h2>
            <a routerLink="/login" class="btn-primary mt-5">Login</a>
          </div>
        } @else {
          <div class="grid gap-4">
            @for (order of orders(); track order._id) {
              <article class="panel p-5">
                <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p class="text-sm font-black">Order {{ order._id }}</p>
                    <p class="mt-1 text-sm text-slate-500">{{ order.createdAt | date:'medium' }}</p>
                    <div class="mt-4 flex flex-wrap gap-2">
                      @for (line of order.items; track line._id) {
                        <img class="h-16 w-12 object-cover" [src]="line.image" [alt]="line.productName" [title]="line.productName">
                      }
                    </div>
                  </div>
                  <div class="text-left md:text-right">
                    <span class="rounded-full bg-purple-50 px-3 py-1 text-xs font-black uppercase text-royal dark:bg-white/8">{{ order.status }}</span>
                    <p class="mt-3 text-xl font-black">{{ order.totalPrice | currency }}</p>
                    <a [routerLink]="['/orders', order._id, 'confirmation']" class="mt-3 inline-flex text-sm font-bold text-royal">Details</a>
                  </div>
                </div>
              </article>
            } @empty {
              <div class="py-24 text-center">
                <h2 class="text-2xl font-black">No orders yet</h2>
                <p class="mt-3 text-sm text-slate-500">Your order history will appear here after checkout.</p>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `
})
export class UserDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly orderApi = inject(OrderService);
  readonly orders = signal<Order[]>([]);

  ngOnInit() {
    if (!this.auth.isAuthenticated()) return;
    this.orderApi.getUserOrders().subscribe((response) => this.orders.set(response.orders));
  }
}

