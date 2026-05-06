import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus, User } from '../../core/models';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div>
      <div class="mb-6">
        <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Order lifecycle</p>
        <h1 class="mt-2 text-4xl font-black text-ink dark:text-white">Orders</h1>
      </div>

      <section class="panel overflow-x-auto p-4">
        <table class="w-full min-w-[860px] text-left text-sm">
          <thead class="text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th class="p-3">Order</th>
              <th class="p-3">Customer</th>
              <th class="p-3">Total</th>
              <th class="p-3">Payment</th>
              <th class="p-3">Status</th>
              <th class="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders(); track order._id) {
              <tr class="border-t border-purple-100 dark:border-white/10">
                <td class="p-3 font-black">{{ order._id }}</td>
                <td class="p-3">{{ customerName(order) }}</td>
                <td class="p-3 font-black">{{ order.totalPrice | currency }}</td>
                <td class="p-3">{{ order.paymentMethod }}</td>
                <td class="p-3">
                  <select class="input max-w-44 py-2" [ngModel]="order.status" (change)="onStatusChange(order, $event)">
                    @for (status of statuses; track status) {
                      <option [value]="status">{{ status }}</option>
                    }
                  </select>
                </td>
                <td class="p-3">{{ order.createdAt | date:'short' }}</td>
              </tr>
            } @empty {
              <tr>
                <td class="p-6 text-center text-slate-500" colspan="6">No orders yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderApi = inject(OrderService);
  private readonly toast = inject(ToastService);
  readonly orders = signal<Order[]>([]);
  readonly statuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.orderApi.getAdminOrders().subscribe((response) => this.orders.set(response.orders));
  }

  customerName(order: Order) {
    return typeof order.user === 'string' ? order.user : (order.user as User).name;
  }

  onStatusChange(order: Order, event: Event) {
    const status = (event.target as HTMLSelectElement).value as OrderStatus;
    this.orderApi.updateStatus(order._id, status).subscribe({
      next: () => {
        this.toast.show('Order status updated', 'success');
        this.load();
      },
      error: (error) => this.toast.show(error.error?.message || 'Could not update order', 'error')
    });
  }
}

