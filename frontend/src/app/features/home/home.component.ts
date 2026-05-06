import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductRailComponent } from '../../shared/product-rail/product-rail.component';
import { SkeletonGridComponent } from '../../shared/skeleton-grid/skeleton-grid.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, ProductRailComponent, SkeletonGridComponent],
  template: `
    <section class="relative min-h-[78vh] overflow-hidden">
      <img class="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=80" alt="Fashion editorial with premium styling">
      <div class="absolute inset-0 bg-gradient-to-r from-[#120b1c]/90 via-[#21172f]/58 to-transparent"></div>
      <div class="section-pad relative mx-auto flex min-h-[78vh] max-w-7xl items-center pb-24 pt-10">
        <div class="max-w-2xl text-white">
          <p class="text-xs font-black uppercase tracking-[0.4em] text-champagne">New season edit</p>
          <h1 class="mt-5 text-5xl font-black leading-[0.96] sm:text-7xl">Veloura</h1>
          <p class="mt-6 max-w-xl text-base leading-7 text-purple-50 sm:text-lg">
            Tailored fashion, athletic energy, and adaptive recommendations designed to move shoppers from discovery to checkout faster.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/shop" class="btn-primary bg-white text-velvet hover:bg-champagne">Shop arrivals</a>
            <a routerLink="/shop" [queryParams]="{sort: 'trending'}" class="btn-secondary border-white/30 bg-white/10 text-white hover:border-white hover:text-white">Trending now</a>
          </div>
          <div class="mt-8 grid max-w-xl grid-cols-3 gap-3 text-xs font-bold text-purple-50">
            <span class="rounded-full bg-white/12 px-4 py-3 backdrop-blur">COD available</span>
            <span class="rounded-full bg-white/12 px-4 py-3 backdrop-blur">Low-stock alerts</span>
            <span class="rounded-full bg-white/12 px-4 py-3 backdrop-blur">Secure checkout</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section-pad -mt-16 pb-8">
      <div class="relative mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        <a routerLink="/shop" [queryParams]="{category: 'Women'}" class="group min-h-44 overflow-hidden bg-velvet p-7 text-white transition hover:-translate-y-1">
          <p class="text-xs font-black uppercase tracking-[0.3em] text-champagne">Women</p>
          <h2 class="mt-3 text-2xl font-black">Sharp silhouettes</h2>
          <p class="mt-3 text-sm text-purple-100">Studio-ready pieces with polished conversion detail.</p>
        </a>
        <a routerLink="/shop" [queryParams]="{category: 'Men'}" class="group min-h-44 overflow-hidden bg-[#16111f] p-7 text-white transition hover:-translate-y-1">
          <p class="text-xs font-black uppercase tracking-[0.3em] text-champagne">Men</p>
          <h2 class="mt-3 text-2xl font-black">Utility motion</h2>
          <p class="mt-3 text-sm text-purple-100">Nike-style energy in a clean luxury layout.</p>
        </a>
        <a routerLink="/shop" [queryParams]="{category: 'Accessories'}" class="group min-h-44 overflow-hidden bg-[#f2eafb] p-7 text-velvet transition hover:-translate-y-1 dark:bg-white/8 dark:text-white">
          <p class="text-xs font-black uppercase tracking-[0.3em] text-royal">Accessories</p>
          <h2 class="mt-3 text-2xl font-black">Finish the look</h2>
          <p class="mt-3 text-sm text-slate-600 dark:text-slate-300">Cross-sell-ready products for higher basket value.</p>
        </a>
      </div>
    </section>

    <section class="section-pad py-12">
      <div class="mx-auto max-w-7xl">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.3em] text-royal">Live catalog</p>
            <h2 class="mt-2 text-3xl font-black text-ink dark:text-white">Trending now</h2>
          </div>
          <a routerLink="/shop" class="text-sm font-bold text-royal">View all</a>
        </div>
        @if (loading()) {
          <app-skeleton-grid />
        } @else {
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            @for (product of trending(); track product._id) {
              <app-product-card [product]="product" />
            }
          </div>
        }
      </div>
    </section>

    <app-product-rail title="Recommended for you" eyebrow="AI picks" [products]="recommended()" />
  `
})
export class HomeComponent implements OnInit {
  private readonly productsApi = inject(ProductService);
  private readonly recommendations = inject(RecommendationService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly trending = signal<Product[]>([]);
  readonly recommended = signal<Product[]>([]);

  ngOnInit() {
    this.productsApi.getProducts({ sort: 'trending', limit: 8 }).subscribe({
      next: (response) => {
        this.trending.set(response.products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    const userId = this.auth.user()?._id || this.auth.user()?.id || 'guest';
    this.recommendations.get(userId).subscribe({
      next: (response) => this.recommended.set(response.recommendedForYou),
      error: () => this.recommended.set([])
    });
  }
}
