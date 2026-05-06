import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../core/models';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="section-pad py-12">
      <div class="mx-auto max-w-4xl">
        @if (order(); as item) {
          <div class="panel p-8">
            <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Order confirmed</p>
            <h1 class="mt-3 text-4xl font-black text-ink dark:text-white">Thank you, {{ item.shippingAddress.fullName }}</h1>
            <p class="mt-3 text-sm text-slate-600 dark:text-slate-300">Order {{ item._id }} was created on {{ item.createdAt | date:'medium' }}.</p>

            <div class="mt-8 grid grid-cols-5 gap-2 text-center text-xs font-bold">
              @for (status of statuses; track status) {
                <div class="rounded-full px-3 py-2" [class.bg-royal]="statusIndex(status) <= statusIndex(item.status)" [class.text-white]="statusIndex(status) <= statusIndex(item.status)" [class.bg-purple-50]="statusIndex(status) > statusIndex(item.status)" [class.text-slate-500]="statusIndex(status) > statusIndex(item.status)">
                  {{ status }}
                </div>
              }
            </div>

            <div class="mt-8 grid gap-4">
              @for (line of item.items; track line._id) {
                <div class="flex items-center justify-between gap-4 rounded-xl bg-purple-50 p-4 dark:bg-white/5">
                  <div class="flex items-center gap-4">
                    <img class="h-20 w-16 object-cover" [src]="line.image" [alt]="line.productName">
                    <div>
                      <p class="font-black">{{ line.productName }}</p>
                      <p class="text-sm text-slate-500">{{ line.size }} · {{ line.color }} · Qty {{ line.quantity }}</p>
                    </div>
                  </div>
                  <strong>{{ line.price * line.quantity | currency }}</strong>
                </div>
              }
            </div>

            <div class="mt-8 grid gap-3 border-t border-purple-100 pt-6 text-sm dark:border-white/10">
              <div class="flex justify-between"><span>Subtotal</span><strong>{{ item.subtotal | currency }}</strong></div>
              <div class="flex justify-between"><span>Discount</span><strong>-{{ item.discount | currency }}</strong></div>
              <div class="flex justify-between"><span>Shipping</span><strong>{{ item.shippingFee === 0 ? 'Free' : (item.shippingFee | currency) }}</strong></div>
              <div class="flex justify-between text-lg font-black"><span>Total</span><span>{{ item.totalPrice | currency }}</span></div>
            </div>

            <div class="mt-8 flex flex-wrap gap-3">
              <a routerLink="/orders" class="btn-primary">View order history</a>
              <a routerLink="/shop" class="btn-secondary">Keep shopping</a>
            </div>
          </div>
        } @else {
          <div class="skeleton h-96"></div>
        }
      </div>
    </section>
  `
})
export class OrderConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(OrderService);

  readonly order = signal<Order | null>(null);
  readonly statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.orders.getOrder(id).subscribe((response) => this.order.set(response.order));
  }

  statusIndex(status: string) {
    return this.statuses.indexOf(status);
  }
}

