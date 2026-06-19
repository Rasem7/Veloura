import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

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
            {{ language.t('footer.description') }}
          </p>
          <div class="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span class="rounded-full bg-purple-50 px-3 py-2 dark:bg-white/5">{{ language.t('footer.secure') }}</span>
            <span class="rounded-full bg-purple-50 px-3 py-2 dark:bg-white/5">{{ language.t('footer.shipping') }}</span>
            <span class="rounded-full bg-purple-50 px-3 py-2 dark:bg-white/5">{{ language.t('footer.returns') }}</span>
          </div>
        </div>
        <div>
          <p class="text-sm font-bold text-ink dark:text-white">{{ language.t('footer.shop') }}</p>
          <div class="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            <a routerLink="/shop" class="hover:text-royal">{{ language.t('footer.allProducts') }}</a>
            <a routerLink="/shop" [queryParams]="{category: 'Women'}" class="hover:text-royal">{{ language.t('nav.women') }}</a>
            <a routerLink="/shop" [queryParams]="{category: 'Men'}" class="hover:text-royal">{{ language.t('nav.men') }}</a>
          </div>
        </div>
        <div>
          <p class="text-sm font-bold text-ink dark:text-white">{{ language.t('footer.support') }}</p>
          <div class="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span>support@veloura.local</span>
            <span>{{ language.t('footer.payments') }}</span>
            <span>{{ language.t('footer.email') }}</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly language = inject(LanguageService);
}
