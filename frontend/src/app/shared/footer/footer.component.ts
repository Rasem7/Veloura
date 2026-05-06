import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="section-pad border-t border-purple-100 bg-white py-10 dark:border-white/10 dark:bg-[#100d16]">
      <div class="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p class="text-sm font-black uppercase tracking-[0.34em] text-velvet dark:text-white">Veloura</p>
          <p class="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            Premium fashion commerce built around fast buying, confident checkout, and adaptive recommendations.
          </p>
          <div class="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span class="rounded-full bg-purple-50 px-3 py-2 dark:bg-white/5">Secure checkout</span>
            <span class="rounded-full bg-purple-50 px-3 py-2 dark:bg-white/5">Free shipping over $150</span>
            <span class="rounded-full bg-purple-50 px-3 py-2 dark:bg-white/5">Easy returns</span>
          </div>
        </div>
        <div>
          <p class="text-sm font-bold text-ink dark:text-white">Shop</p>
          <div class="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            <a routerLink="/shop" class="hover:text-royal">All products</a>
            <a routerLink="/shop" [queryParams]="{category: 'Women'}" class="hover:text-royal">Women</a>
            <a routerLink="/shop" [queryParams]="{category: 'Men'}" class="hover:text-royal">Men</a>
          </div>
        </div>
        <div>
          <p class="text-sm font-bold text-ink dark:text-white">Support</p>
          <div class="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span>support@veloura.local</span>
            <span>COD and Stripe-ready payments</span>
            <span>Mock email notifications enabled</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}

