import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastContainerComponent } from './shared/toast-container/toast-container.component';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  template: `
    <div class="min-h-screen bg-[#fbfafc] text-ink transition-colors dark:bg-[#100d16] dark:text-white">
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

  constructor() {
    this.cart.bootstrap();
  }
}

