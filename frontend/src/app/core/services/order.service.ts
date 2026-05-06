import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Order, OrderStatus, PaymentMethod, ShippingAddress } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  createOrder(payload: { shippingAddress: ShippingAddress; paymentMethod: PaymentMethod; couponCode?: string }) {
    return this.http.post<{ order: Order }>(`${environment.apiUrl}/orders`, payload);
  }

  getUserOrders() {
    return this.http.get<{ orders: Order[] }>(`${environment.apiUrl}/orders/user`);
  }

  getOrder(id: string) {
    return this.http.get<{ order: Order }>(`${environment.apiUrl}/orders/${id}`);
  }

  getAdminOrders(status?: string) {
    if (status) {
      return this.http.get<{ orders: Order[] }>(`${environment.apiUrl}/orders/admin`, { params: { status } });
    }

    return this.http.get<{ orders: Order[] }>(`${environment.apiUrl}/orders/admin`);
  }

  updateStatus(id: string, status: OrderStatus) {
    return this.http.put<{ order: Order }>(`${environment.apiUrl}/orders/${id}/status`, { status });
  }
}
