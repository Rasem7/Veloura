import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PaymentMethod, ShippingAddress } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink],
  template: `
    <section class="section-pad py-10">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8">
          <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Checkout</p>
          <h1 class="mt-2 text-4xl font-black text-ink dark:text-white">Complete your order</h1>
          <div class="mt-6 grid max-w-3xl grid-cols-4 gap-2 text-center text-xs font-bold">
            @for (label of steps; track label; let index = $index) {
              <div class="rounded-full px-3 py-2" [class.bg-royal]="index <= step()" [class.text-white]="index <= step()" [class.bg-purple-50]="index > step()" [class.text-slate-500]="index > step()">{{ label }}</div>
            }
          </div>
        </div>

        @if (!auth.isAuthenticated()) {
          <div class="panel p-6">
            <h2 class="text-xl font-black">Login required</h2>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Create an account or login so your cart, order history, and recommendations stay synced.</p>
            <a routerLink="/login" [queryParams]="{returnUrl: '/checkout'}" class="btn-primary mt-5">Login to continue</a>
          </div>
        } @else if (!cart.items().length) {
          <div class="py-20 text-center">
            <h2 class="text-2xl font-black">Your cart is empty</h2>
            <a routerLink="/shop" class="btn-primary mt-5">Shop now</a>
          </div>
        } @else {
          <div class="grid gap-8 lg:grid-cols-[1fr_24rem]">
            <form class="panel p-6" (ngSubmit)="placeOrder()">
              @if (step() === 0) {
                <h2 class="text-2xl font-black">Cart review</h2>
                <div class="mt-5 grid gap-3">
                  @for (item of cart.items(); track item._id || item.localId) {
                    <div class="flex items-center justify-between gap-4 rounded-xl bg-purple-50 p-3 dark:bg-white/5">
                      <div>
                        <p class="font-bold">{{ item.product.name }}</p>
                        <p class="text-sm text-slate-500">{{ item.quantity }} × {{ item.priceSnapshot | currency }}</p>
                      </div>
                      <span class="font-black">{{ item.quantity * item.priceSnapshot | currency }}</span>
                    </div>
                  }
                </div>
                <button type="button" class="btn-primary mt-6" (click)="step.set(1)">Shipping details</button>
              }

              @if (step() === 1) {
                <h2 class="text-2xl font-black">Shipping</h2>
                <div class="mt-5 grid gap-4 md:grid-cols-2">
                  <input class="input" required name="fullName" [(ngModel)]="shipping.fullName" placeholder="Full name">
                  <input class="input" required name="phone" [(ngModel)]="shipping.phone" placeholder="Phone">
                  <input class="input md:col-span-2" required name="line1" [(ngModel)]="shipping.line1" placeholder="Address line 1">
                  <input class="input md:col-span-2" name="line2" [(ngModel)]="shipping.line2" placeholder="Apartment, suite, etc.">
                  <input class="input" required name="city" [(ngModel)]="shipping.city" placeholder="City">
                  <input class="input" name="state" [(ngModel)]="shipping.state" placeholder="State">
                  <input class="input" required name="postalCode" [(ngModel)]="shipping.postalCode" placeholder="Postal code">
                  <input class="input" required name="country" [(ngModel)]="shipping.country" placeholder="Country">
                </div>
                <div class="mt-6 flex gap-3">
                  <button type="button" class="btn-secondary" (click)="step.set(0)">Back</button>
                  <button type="button" class="btn-primary" (click)="step.set(2)">Payment</button>
                </div>
              }

              @if (step() === 2) {
                <h2 class="text-2xl font-black">Payment</h2>
                <div class="mt-5 grid gap-3">
                  <label class="flex cursor-pointer items-center justify-between rounded-xl border border-purple-100 p-4 dark:border-white/10">
                    <span>
                      <strong>Cash on delivery</strong>
                      <span class="mt-1 block text-sm text-slate-500">Default payment method for local launch.</span>
                    </span>
                    <input type="radio" name="payment" [(ngModel)]="paymentMethod" value="cash_on_delivery">
                  </label>
                  <label class="flex cursor-pointer items-center justify-between rounded-xl border border-purple-100 p-4 dark:border-white/10">
                    <span>
                      <strong>Stripe-ready card payment</strong>
                      <span class="mt-1 block text-sm text-slate-500">API structure is ready for Stripe PaymentIntents.</span>
                    </span>
                    <input type="radio" name="payment" [(ngModel)]="paymentMethod" value="stripe">
                  </label>
                  <input class="input" name="couponCode" [(ngModel)]="couponCode" placeholder="Coupon code, e.g. FIRST15">
                </div>
                <div class="mt-6 flex gap-3">
                  <button type="button" class="btn-secondary" (click)="step.set(1)">Back</button>
                  <button type="submit" class="btn-primary" [disabled]="placing()">Place order</button>
                </div>
              }
            </form>

            <aside class="panel h-fit p-6 lg:sticky lg:top-28">
              <h2 class="text-xl font-black">Price breakdown</h2>
              <div class="mt-5 grid gap-3 text-sm">
                <div class="flex justify-between"><span>Subtotal</span><strong>{{ cart.subtotal() | currency }}</strong></div>
                <div class="flex justify-between"><span>Shipping</span><strong>{{ cart.shipping() === 0 ? 'Free' : (cart.shipping() | currency) }}</strong></div>
                <div class="flex justify-between text-emerald-700"><span>Free returns</span><strong>Included</strong></div>
                <div class="border-t border-purple-100 pt-3 text-lg font-black dark:border-white/10 flex justify-between"><span>Total</span><span>{{ cart.total() | currency }}</span></div>
              </div>
              <div class="mt-6 grid gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Encrypted checkout flow</span>
                <span>Order confirmation page included</span>
                <span>Admin can update order status</span>
              </div>
            </aside>
          </div>
        }
      </div>
    </section>
  `
})
export class CheckoutComponent {
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  private readonly orders = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly steps = ['Cart', 'Shipping', 'Payment', 'Confirmation'];
  readonly step = signal(0);
  readonly placing = signal(false);

  shipping: ShippingAddress = {
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    postalCode: '',
    country: 'United States'
  };
  paymentMethod: PaymentMethod = 'cash_on_delivery';
  couponCode = '';

  placeOrder() {
    this.placing.set(true);
    this.orders.createOrder({
      shippingAddress: this.shipping,
      paymentMethod: this.paymentMethod,
      couponCode: this.couponCode || undefined
    }).subscribe({
      next: (response) => {
        this.cart.clearLocal();
        this.step.set(3);
        this.toast.show('Order placed successfully', 'success');
        this.router.navigate(['/orders', response.order._id, 'confirmation']);
      },
      error: (error) => {
        this.placing.set(false);
        this.toast.show(error.error?.message || 'Could not place order', 'error');
      }
    });
  }
}

