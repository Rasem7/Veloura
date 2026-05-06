import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `
    <section class="section-pad py-10">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Cart</p>
            <h1 class="mt-2 text-4xl font-black text-ink dark:text-white">Your bag</h1>
          </div>
          <div class="flex flex-wrap gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span class="rounded-full bg-purple-50 px-3 py-2 dark:bg-white/5">Secure checkout</span>
            <span class="rounded-full bg-purple-50 px-3 py-2 dark:bg-white/5">Easy returns</span>
            <span class="rounded-full bg-purple-50 px-3 py-2 dark:bg-white/5">COD default</span>
          </div>
        </div>

        @if (cart.items().length) {
          <div class="grid gap-8 lg:grid-cols-[1fr_24rem]">
            <div class="grid gap-4">
              @for (item of cart.items(); track item._id || item.localId) {
                <article class="panel grid gap-4 p-4 sm:grid-cols-[8rem_1fr_auto]">
                  <img class="aspect-[4/5] w-full object-cover" [src]="item.product.images[0]?.url" [alt]="item.product.name">
                  <div>
                    <h2 class="font-black">{{ item.product.name }}</h2>
                    <p class="mt-1 text-sm text-slate-500">{{ item.size }} · {{ item.color }}</p>
                    <p class="mt-3 text-sm font-bold">{{ item.priceSnapshot | currency }}</p>
                    <div class="mt-4 inline-grid grid-cols-3 overflow-hidden rounded-full border border-purple-100 dark:border-white/10">
                      <button class="px-4 py-2" type="button" (click)="cart.updateQuantity(item, item.quantity - 1)">−</button>
                      <span class="grid place-items-center px-4 py-2 text-sm font-bold">{{ item.quantity }}</span>
                      <button class="px-4 py-2" type="button" (click)="cart.updateQuantity(item, item.quantity + 1)">+</button>
                    </div>
                  </div>
                  <button class="self-start rounded-full px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50" type="button" (click)="cart.remove(item)">Remove</button>
                </article>
              }
            </div>

            <aside class="panel h-fit p-6 lg:sticky lg:top-28">
              <h2 class="text-xl font-black">Order summary</h2>
              <div class="mt-5 grid gap-3 text-sm">
                <div class="flex justify-between"><span>Subtotal</span><strong>{{ cart.subtotal() | currency }}</strong></div>
                <div class="flex justify-between"><span>Shipping</span><strong>{{ cart.shipping() === 0 ? 'Free' : (cart.shipping() | currency) }}</strong></div>
                <div class="border-t border-purple-100 pt-3 text-lg font-black dark:border-white/10 flex justify-between"><span>Total</span><span>{{ cart.total() | currency }}</span></div>
              </div>
              <a routerLink="/checkout" class="btn-primary mt-6 w-full">Checkout</a>
              <a routerLink="/shop" class="btn-secondary mt-3 w-full">Continue shopping</a>
            </aside>
          </div>
        } @else {
          <div class="py-24 text-center">
            <h2 class="text-2xl font-black text-ink dark:text-white">Your bag is empty</h2>
            <p class="mt-3 text-sm text-slate-500">Add a product to start a checkout-ready cart.</p>
            <a routerLink="/shop" class="btn-primary mt-6">Shop products</a>
          </div>
        }
      </div>
    </section>
  `
})
export class CartComponent {
  readonly cart = inject(CartService);
}

