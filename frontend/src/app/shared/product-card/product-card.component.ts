import { CurrencyPipe } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="group">
      <a class="block overflow-hidden bg-slate-100 dark:bg-white/5" [routerLink]="['/product', product.slug]" (click)="trackClick()">
        <div class="relative aspect-[4/5] overflow-hidden">
          <img class="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-0" [src]="primaryImage" [alt]="product.images[0]?.alt || product.name" loading="lazy">
          <img class="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100" [src]="hoverImage" [alt]="product.images[1]?.alt || product.name" loading="lazy">
          @if (lowStock > 0 && lowStock <= 5) {
            <span class="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase text-white">Only {{ lowStock }} left</span>
          }
          @if (product.compareAtPrice) {
            <span class="absolute right-3 top-3 rounded-full bg-velvet px-3 py-1 text-xs font-black uppercase text-white">Save {{ product.compareAtPrice - product.price | currency }}</span>
          }
        </div>
      </a>

      <div class="mt-4 flex items-start justify-between gap-3">
        <div>
          <a [routerLink]="['/product', product.slug]" class="text-sm font-bold text-ink transition hover:text-royal dark:text-white">{{ product.name }}</a>
          <p class="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{{ product.category }}</p>
          <div class="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span class="font-bold text-champagne">★ {{ product.ratingAverage || 4.8 }}</span>
            <span>{{ product.reviewCount || 12 }} reviews</span>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-black text-ink dark:text-white">{{ product.price | currency }}</p>
          @if (product.compareAtPrice) {
            <p class="text-xs text-slate-400 line-through">{{ product.compareAtPrice | currency }}</p>
          }
        </div>
      </div>

      <button type="button" class="mt-4 w-full rounded-full bg-ink px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-royal dark:bg-white dark:text-ink" (click)="quickAdd()">
        Quick add
      </button>
    </article>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private readonly cart = inject(CartService);
  private readonly products = inject(ProductService);
  private readonly sessionId = localStorage.getItem('veloura_session') || crypto.randomUUID();

  get primaryImage() {
    return this.product.images[0]?.url || 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80';
  }

  get hoverImage() {
    return this.product.images[1]?.url || this.primaryImage;
  }

  get lowStock() {
    return this.product.sizes.reduce((min, size) => Math.min(min, size.stock), Number.POSITIVE_INFINITY);
  }

  quickAdd() {
    const size = this.product.sizes.find((row) => row.stock > 0)?.label;
    const color = this.product.colors[0];
    this.cart.add(this.product, 1, size, color);
  }

  trackClick() {
    localStorage.setItem('veloura_session', this.sessionId);
    this.products.trackInteraction(this.product._id, 'click', this.sessionId).subscribe();
  }
}

