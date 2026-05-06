import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product, RecommendationResponse, Review } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductRailComponent } from '../../shared/product-rail/product-rail.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink, ProductRailComponent],
  template: `
    <section class="section-pad py-8">
      <div class="mx-auto max-w-7xl">
        @if (product(); as item) {
          <div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div class="grid gap-4 md:grid-cols-[6rem_1fr]">
              <div class="order-2 flex gap-3 md:order-1 md:grid">
                @for (image of item.images; track image.url) {
                  <button type="button" class="aspect-square overflow-hidden border border-purple-100 transition hover:border-royal dark:border-white/10" (click)="selectedImage.set(image.url)">
                    <img class="h-full w-full object-cover" [src]="image.url" [alt]="image.alt || item.name">
                  </button>
                }
              </div>
              <div class="order-1 overflow-hidden bg-slate-100 dark:bg-white/5 md:order-2">
                <img class="aspect-[4/5] w-full object-cover" [src]="selectedImage() || item.images[0]?.url" [alt]="item.name">
              </div>
            </div>

            <div class="lg:sticky lg:top-28 lg:self-start">
              <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">{{ item.category }}</p>
              <h1 class="mt-3 text-4xl font-black leading-tight text-ink dark:text-white">{{ item.name }}</h1>
              <div class="mt-4 flex flex-wrap items-center gap-4">
                <p class="text-2xl font-black">{{ item.price | currency }}</p>
                @if (item.compareAtPrice) {
                  <p class="text-lg text-slate-400 line-through">{{ item.compareAtPrice | currency }}</p>
                }
                <span class="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-royal dark:bg-white/8">★ {{ item.ratingAverage || 4.8 }} · {{ item.reviewCount || 12 }} reviews</span>
              </div>
              <p class="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{{ item.description }}</p>

              <div class="mt-7 grid gap-5">
                <div>
                  <p class="mb-3 text-sm font-bold">Color</p>
                  <div class="flex flex-wrap gap-2">
                    @for (color of item.colors; track color) {
                      <button type="button" class="rounded-full border px-4 py-2 text-sm font-semibold transition"
                        [class.border-royal]="selectedColor() === color"
                        [class.bg-purple-50]="selectedColor() === color"
                        [class.border-purple-100]="selectedColor() !== color"
                        (click)="selectedColor.set(color)">
                        {{ color }}
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <div class="mb-3 flex items-center justify-between">
                    <p class="text-sm font-bold">Size</p>
                    <span class="text-xs font-semibold text-red-600">{{ lowStockLabel(item) }}</span>
                  </div>
                  <div class="grid grid-cols-5 gap-2">
                    @for (size of item.sizes; track size.label) {
                      <button type="button" class="rounded-xl border px-3 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-35"
                        [disabled]="size.stock === 0"
                        [class.border-royal]="selectedSize() === size.label"
                        [class.bg-velvet]="selectedSize() === size.label"
                        [class.text-white]="selectedSize() === size.label"
                        [class.border-purple-100]="selectedSize() !== size.label"
                        (click)="selectedSize.set(size.label)">
                        {{ size.label }}
                      </button>
                    }
                  </div>
                </div>

                <div class="grid grid-cols-[8rem_1fr] gap-3">
                  <input class="input" type="number" min="1" name="quantity" [(ngModel)]="quantity">
                  <button type="button" class="btn-primary" (click)="addToCart(item)">Add to cart</button>
                </div>
              </div>

              <div class="mt-6 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                @for (benefit of item.benefits; track benefit) {
                  <div class="flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3 dark:bg-white/5">
                    <span class="h-2 w-2 rounded-full bg-champagne"></span>
                    <span>{{ benefit }}</span>
                  </div>
                }
              </div>

              <div class="fixed inset-x-0 bottom-0 z-30 border-t border-purple-100 bg-white/95 p-3 backdrop-blur dark:border-white/10 dark:bg-[#100d16]/95 lg:hidden">
                <button type="button" class="btn-primary w-full" (click)="addToCart(item)">Add {{ item.price | currency }} to bag</button>
              </div>
            </div>
          </div>

          <section class="mt-16 grid gap-8 lg:grid-cols-[1fr_24rem]">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.3em] text-royal">Reviews</p>
              <h2 class="mt-2 text-2xl font-black">Social proof</h2>
              <div class="mt-6 grid gap-4">
                @for (review of reviews(); track review._id) {
                  <article class="panel p-5">
                    <div class="flex items-center justify-between gap-4">
                      <p class="font-bold">{{ review.title || 'Verified review' }}</p>
                      <span class="text-sm font-black text-champagne">★ {{ review.rating }}</span>
                    </div>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ review.comment }}</p>
                    @if (review.isVerifiedPurchase) {
                      <span class="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Verified purchase</span>
                    }
                  </article>
                } @empty {
                  <p class="text-sm text-slate-500">No reviews yet. Be the first to review this product after purchase.</p>
                }
              </div>
            </div>
            <form class="panel p-5" (ngSubmit)="submitReview(item)">
              <h3 class="text-lg font-black">Leave a review</h3>
              <input class="input mt-4" name="title" [(ngModel)]="reviewTitle" placeholder="Title">
              <select class="input mt-3" name="rating" [(ngModel)]="reviewRating">
                <option [ngValue]="5">5 stars</option>
                <option [ngValue]="4">4 stars</option>
                <option [ngValue]="3">3 stars</option>
                <option [ngValue]="2">2 stars</option>
                <option [ngValue]="1">1 star</option>
              </select>
              <textarea class="input mt-3 min-h-28" name="comment" [(ngModel)]="reviewComment" placeholder="Share fit, feel, and quality notes"></textarea>
              <button class="btn-primary mt-4 w-full" type="submit" [disabled]="!auth.isAuthenticated()">Post review</button>
              @if (!auth.isAuthenticated()) {
                <a routerLink="/login" class="mt-3 block text-center text-sm font-bold text-royal">Login to review</a>
              }
            </form>
          </section>

          <app-product-rail title="You may also like" eyebrow="Similar products" [products]="recommendations()?.similarProducts || []" />
          <app-product-rail title="Frequently bought together" eyebrow="Basket builder" [products]="recommendations()?.frequentlyBoughtTogether || []" />
        }
      </div>
    </section>
  `
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductService);
  private readonly recommendationsApi = inject(RecommendationService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly product = signal<Product | null>(null);
  readonly selectedImage = signal('');
  readonly selectedSize = signal('');
  readonly selectedColor = signal('');
  readonly reviews = signal<Review[]>([]);
  readonly recommendations = signal<RecommendationResponse | null>(null);
  readonly sessionId = localStorage.getItem('veloura_session') || crypto.randomUUID();

  quantity = 1;
  reviewTitle = '';
  reviewComment = '';
  reviewRating = 5;

  ngOnInit() {
    localStorage.setItem('veloura_session', this.sessionId);
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) return;

      this.productsApi.getProduct(slug, this.sessionId).subscribe((response) => {
        const item = response.product;
        this.product.set(item);
        this.selectedImage.set(item.images[0]?.url || '');
        this.selectedSize.set(item.sizes.find((size) => size.stock > 0)?.label || '');
        this.selectedColor.set(item.colors[0] || '');
        this.loadReviews(item._id);
        this.loadRecommendations(item._id);
      });
    });
  }

  addToCart(item: Product) {
    if (!this.selectedSize()) {
      this.toast.show('Choose a size first', 'error');
      return;
    }

    this.cart.add(item, this.quantity, this.selectedSize(), this.selectedColor());
  }

  lowStockLabel(item: Product) {
    const stock = item.sizes.reduce((sum, size) => sum + size.stock, 0);
    return stock <= 8 ? `Selling fast: ${stock} left` : 'In stock';
  }

  submitReview(item: Product) {
    if (!this.auth.isAuthenticated()) {
      this.toast.show('Login to review this product', 'error');
      return;
    }

    this.productsApi.addReview(item._id, {
      rating: Number(this.reviewRating),
      title: this.reviewTitle,
      comment: this.reviewComment
    }).subscribe({
      next: () => {
        this.toast.show('Review saved', 'success');
        this.reviewTitle = '';
        this.reviewComment = '';
        this.loadReviews(item._id);
      },
      error: (error) => this.toast.show(error.error?.message || 'Could not save review', 'error')
    });
  }

  private loadReviews(productId: string) {
    this.productsApi.getReviews(productId).subscribe((response) => this.reviews.set(response.reviews));
  }

  private loadRecommendations(productId: string) {
    const userId = this.auth.user()?._id || this.auth.user()?.id || 'guest';
    this.recommendationsApi.get(userId, productId).subscribe((response) => this.recommendations.set(response));
  }
}

