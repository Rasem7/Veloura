import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, ProductCategory } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { SkeletonGridComponent } from '../../shared/skeleton-grid/skeleton-grid.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [FormsModule, RouterLink, ProductCardComponent, SkeletonGridComponent],
  template: `
    <section class="section-pad bg-white py-10 dark:bg-[#100d16]">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col justify-between gap-6 border-b border-purple-100 pb-8 dark:border-white/10 md:flex-row md:items-end">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Shop</p>
            <h1 class="mt-2 text-4xl font-black text-ink dark:text-white">Premium fashion catalog</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Fast filters, social proof, low-stock signals, and product cards optimized for add-to-cart intent.</p>
          </div>
          <a routerLink="/cart" class="btn-primary">Review bag</a>
        </div>

        <form class="mt-8 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]" (ngSubmit)="applyFilters()">
          <input class="input" name="search" [(ngModel)]="filters.search" placeholder="Search products">
          <select class="input" name="category" [(ngModel)]="filters.category">
            <option value="">All categories</option>
            <option value="Women">Women</option>
            <option value="Men">Men</option>
            <option value="Accessories">Accessories</option>
          </select>
          <select class="input" name="sort" [(ngModel)]="filters.sort">
            <option value="trending">Trending</option>
            <option value="latest">Newest</option>
            <option value="rating">Top rated</option>
            <option value="priceAsc">Price low to high</option>
            <option value="priceDesc">Price high to low</option>
          </select>
          <input class="input" type="number" name="maxPrice" [(ngModel)]="filters.maxPrice" placeholder="Max price">
          <button class="btn-primary" type="submit">Filter</button>
        </form>
      </div>
    </section>

    <section class="section-pad py-10">
      <div class="mx-auto max-w-7xl">
        @if (loading()) {
          <app-skeleton-grid />
        } @else if (products().length) {
          <div class="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            @for (product of products(); track product._id) {
              <app-product-card [product]="product" />
            }
          </div>
          <div class="mt-10 flex justify-center gap-3">
            <button type="button" class="btn-secondary" [disabled]="page() === 1" (click)="load(page() - 1)">Previous</button>
            <span class="grid place-items-center rounded-full px-4 text-sm font-bold text-slate-500">Page {{ page() }} of {{ pages() }}</span>
            <button type="button" class="btn-secondary" [disabled]="page() >= pages()" (click)="load(page() + 1)">Next</button>
          </div>
        } @else {
          <div class="py-24 text-center">
            <h2 class="text-2xl font-black text-ink dark:text-white">No products found</h2>
            <p class="mt-3 text-sm text-slate-500">Try a broader search or clear the filters.</p>
          </div>
        }
      </div>
    </section>
  `
})
export class ProductListComponent implements OnInit {
  private readonly productsApi = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly products = signal<Product[]>([]);
  readonly page = signal(1);
  readonly pages = signal(1);

  filters: {
    search: string;
    category: '' | ProductCategory;
    sort: string;
    maxPrice?: number;
  } = {
    search: '',
    category: '',
    sort: 'trending'
  };

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.filters.category = (params['category'] || '') as '' | ProductCategory;
      this.filters.sort = params['sort'] || 'trending';
      this.load(1);
    });
  }

  applyFilters() {
    this.router.navigate(['/shop'], {
      queryParams: {
        category: this.filters.category || undefined,
        sort: this.filters.sort
      }
    });
    this.load(1);
  }

  load(page: number) {
    this.loading.set(true);
    this.page.set(page);
    this.productsApi.getProducts({ ...this.filters, page, limit: 12 }).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.pages.set(Math.max(response.pagination.pages, 1));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}

