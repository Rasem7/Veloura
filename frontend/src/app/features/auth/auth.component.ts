import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="section-pad grid min-h-[calc(100vh-5rem)] place-items-center py-12">
      <div class="grid w-full max-w-5xl overflow-hidden bg-white shadow-2xl shadow-purple-950/10 dark:bg-white/[0.04] md:grid-cols-[1fr_1.1fr]">
        <div class="relative min-h-80">
          <img class="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80" alt="Premium fashion shopping">
          <div class="absolute inset-0 bg-velvet/72"></div>
          <div class="relative flex h-full flex-col justify-end p-8 text-white">
            <p class="text-xs font-black uppercase tracking-[0.34em] text-champagne">Account</p>
            <h1 class="mt-3 text-4xl font-black">{{ isRegister() ? 'Create your profile' : 'Welcome back' }}</h1>
            <p class="mt-4 text-sm leading-6 text-purple-100">Sync cart, order history, personalized recommendations, and admin controls from one secure JWT session.</p>
          </div>
        </div>

        <form class="p-8" (ngSubmit)="submit()">
          @if (isRegister()) {
            <input class="input" name="name" [(ngModel)]="name" placeholder="Name" required>
          }
          <input class="input mt-4" type="email" name="email" [(ngModel)]="email" placeholder="Email" required>
          <input class="input mt-4" type="password" name="password" [(ngModel)]="password" placeholder="Password" required>
          @if (isRegister()) {
            <input class="input mt-4" name="adminCode" [(ngModel)]="adminCode" placeholder="Admin code optional">
          }
          <button class="btn-primary mt-6 w-full" type="submit" [disabled]="loading()">
            {{ loading() ? 'Please wait...' : (isRegister() ? 'Create account' : 'Login') }}
          </button>

          @if (isRegister()) {
            <p class="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">Already have an account? <a routerLink="/login" class="font-bold text-royal">Login</a></p>
          } @else {
            <p class="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">New here? <a routerLink="/register" class="font-bold text-royal">Create account</a></p>
          }
        </form>
      </div>
    </section>
  `
})
export class AuthComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  readonly isRegister = signal(false);
  readonly loading = signal(false);

  name = '';
  email = '';
  password = '';
  adminCode = '';
  returnUrl = '/shop';

  ngOnInit() {
    this.isRegister.set(this.router.url.startsWith('/register'));
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/shop';
  }

  submit() {
    this.loading.set(true);
    const request = this.isRegister()
      ? this.auth.register({ name: this.name, email: this.email, password: this.password, adminCode: this.adminCode || undefined })
      : this.auth.login({ email: this.email, password: this.password });

    request.subscribe({
      next: () => {
        this.cart.mergeGuestCart().subscribe({
          next: () => {
            this.toast.show('Signed in successfully', 'success');
            this.router.navigateByUrl(this.returnUrl);
          },
          error: () => {
            this.toast.show('Signed in. Cart sync will retry from your bag.', 'info');
            this.router.navigateByUrl(this.returnUrl);
          }
        });
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.show(error.error?.message || 'Authentication failed', 'error');
      }
    });
  }
}

