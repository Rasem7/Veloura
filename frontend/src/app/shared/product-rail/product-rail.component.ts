import { Component, Input } from '@angular/core';
import { Product } from '../../core/models';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-rail',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    @if (products.length) {
      <section class="section-pad py-12">
        <div class="mx-auto max-w-7xl">
          <div class="mb-6 flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.3em] text-royal">{{ eyebrow }}</p>
              <h2 class="mt-2 text-2xl font-black text-ink dark:text-white">{{ title }}</h2>
            </div>
          </div>
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            @for (product of products; track product._id) {
              <app-product-card [product]="product" />
            }
          </div>
        </div>
      </section>
    }
  `
})
export class ProductRailComponent {
  @Input() title = 'Recommended for you';
  @Input() eyebrow = 'AI picks';
  @Input() products: Product[] = [];
}

