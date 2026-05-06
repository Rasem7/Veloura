import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem, Product } from '../models';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

interface AddCartPayload {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly storageKey = 'veloura_cart';

  readonly items = signal<CartItem[]>(this.readLocalCart());
  readonly itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() => Number(this.items().reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0).toFixed(2)));
  readonly shipping = computed(() => this.subtotal() >= 150 || this.subtotal() === 0 ? 0 : 9.95);
  readonly total = computed(() => Number((this.subtotal() + this.shipping()).toFixed(2)));

  bootstrap() {
    if (this.auth.isAuthenticated()) {
      this.mergeGuestCart().subscribe();
      return;
    }

    this.items.set(this.readLocalCart());
  }

  add(product: Product, quantity = 1, size?: string, color?: string) {
    const payload = { productId: product._id, quantity, size, color };

    if (this.auth.isAuthenticated()) {
      this.http.post<{ cart: Cart }>(`${environment.apiUrl}/cart/items`, payload)
        .pipe(tap((response) => this.setFromServer(response.cart)))
        .subscribe({
          next: () => this.toast.show('Added to cart', 'success'),
          error: (error) => this.toast.show(error.error?.message || 'Could not add item', 'error')
        });
      return;
    }

    const localId = `${product._id}-${size || 'any'}-${color || 'any'}`;
    this.items.update((items) => {
      const existing = items.find((item) => item.localId === localId);
      if (existing) {
        return items.map((item) => item.localId === localId ? { ...item, quantity: item.quantity + quantity } : item);
      }

      return [...items, {
        localId,
        product,
        quantity,
        size,
        color,
        priceSnapshot: product.price
      }];
    });
    this.persistLocal();
    this.toast.show('Added to cart', 'success');
  }

  updateQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) return;

    if (this.auth.isAuthenticated() && item._id) {
      this.http.put<{ cart: Cart }>(`${environment.apiUrl}/cart/items/${item._id}`, { quantity })
        .pipe(tap((response) => this.setFromServer(response.cart)))
        .subscribe();
      return;
    }

    this.items.update((items) => items.map((row) => row.localId === item.localId ? { ...row, quantity } : row));
    this.persistLocal();
  }

  remove(item: CartItem) {
    if (this.auth.isAuthenticated() && item._id) {
      this.http.delete<{ cart: Cart }>(`${environment.apiUrl}/cart/items/${item._id}`)
        .pipe(tap((response) => this.setFromServer(response.cart)))
        .subscribe(() => this.toast.show('Removed from cart', 'info'));
      return;
    }

    this.items.update((items) => items.filter((row) => row.localId !== item.localId));
    this.persistLocal();
  }

  clearLocal() {
    this.items.set([]);
    localStorage.removeItem(this.storageKey);
  }

  mergeGuestCart(): Observable<{ cart: Cart }> {
    const localItems = this.readLocalCart();
    const payload = {
      items: localItems.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }))
    };

    return this.http.put<{ cart: Cart }>(`${environment.apiUrl}/cart/sync`, payload)
      .pipe(tap((response) => {
        localStorage.removeItem(this.storageKey);
        this.setFromServer(response.cart);
      }));
  }

  loadServerCart() {
    return this.http.get<{ cart: Cart }>(`${environment.apiUrl}/cart`)
      .pipe(tap((response) => this.setFromServer(response.cart)));
  }

  private setFromServer(cart: Cart) {
    this.items.set(cart.items || []);
  }

  private persistLocal() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
  }

  private readLocalCart(): CartItem[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  }
}

