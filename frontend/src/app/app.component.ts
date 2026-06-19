import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastContainerComponent } from './shared/toast-container/toast-container.component';
import { CartService } from './core/services/cart.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  template: `
    <div class="min-h-screen bg-[#fbfafc] text-ink transition-colors dark:bg-[#100d16] dark:text-white" [attr.dir]="language.dir()" [attr.lang]="language.language()">
      <app-navbar />
      <main class="pt-20">
        <router-outlet />
      </main>
      <app-footer />
      <app-toast-container />
    </div>
  `
})
export class AppComponent {
  private readonly cart = inject(CartService);
  readonly language = inject(LanguageService);

  constructor() {
    this.cart.bootstrap();
  }
}
