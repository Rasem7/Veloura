import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AccountType } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          prompt: (callback?: (notification: any) => void) => void;
        };
      };
    };
  }
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="section-pad grid min-h-[calc(100vh-5rem)] place-items-center py-12">
      <div class="grid w-full max-w-6xl overflow-hidden bg-white shadow-2xl shadow-purple-950/10 dark:bg-white/[0.04] lg:grid-cols-[0.95fr_1.15fr]">
        <div class="relative min-h-96">
          <img class="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80" alt="Premium fashion shopping">
          <div class="absolute inset-0 bg-velvet/75"></div>
          <div class="relative flex h-full flex-col justify-between p-8 text-white">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.34em] text-champagne">Veloura Account</p>
              <h1 class="mt-3 text-4xl font-black">{{ isRegister() ? 'Create your profile' : 'Welcome back' }}</h1>
              <p class="mt-4 max-w-sm text-sm leading-6 text-purple-100">Fast checkout, saved orders, personalized picks, and provider access in one secure account.</p>
            </div>
            <div class="grid gap-3 text-sm sm:grid-cols-3">
              <div class="border border-white/15 bg-white/10 p-3 backdrop-blur">
                <p class="font-black">Secure</p>
                <p class="mt-1 text-xs text-purple-100">JWT sessions</p>
              </div>
              <div class="border border-white/15 bg-white/10 p-3 backdrop-blur">
                <p class="font-black">Instant</p>
                <p class="mt-1 text-xs text-purple-100">Email code</p>
              </div>
              <div class="border border-white/15 bg-white/10 p-3 backdrop-blur">
                <p class="font-black">Ready</p>
                <p class="mt-1 text-xs text-purple-100">Google auth</p>
              </div>
            </div>
          </div>
        </div>

        <form class="p-6 sm:p-8" (ngSubmit)="submit()">
          @if (isRegister()) {
            <div class="mb-5 grid grid-cols-2 gap-2 rounded-full bg-purple-50 p-1 dark:bg-white/8">
              <button class="rounded-full px-4 py-3 text-sm font-black transition" type="button" [class.bg-white]="accountType() === 'client'" [class.text-royal]="accountType() === 'client'" [class.shadow]="accountType() === 'client'" (click)="accountType.set('client')">Client</button>
              <button class="rounded-full px-4 py-3 text-sm font-black transition" type="button" [class.bg-white]="accountType() === 'provider'" [class.text-royal]="accountType() === 'provider'" [class.shadow]="accountType() === 'provider'" (click)="accountType.set('provider')">Provider</button>
            </div>
          }

          <div class="mb-5 grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1 dark:bg-white/8">
            <button class="rounded-full px-4 py-3 text-sm font-black transition" type="button" [class.bg-white]="authMethod() === 'password'" [class.text-royal]="authMethod() === 'password'" [class.shadow]="authMethod() === 'password'" (click)="switchMethod('password')">Email</button>
            <button class="rounded-full px-4 py-3 text-sm font-black transition" type="button" [class.bg-white]="authMethod() === 'code'" [class.text-royal]="authMethod() === 'code'" [class.shadow]="authMethod() === 'code'" (click)="switchMethod('code')">Code</button>
          </div>

          <button class="mb-5 flex w-full items-center justify-center gap-3 rounded-full border border-purple-100 px-5 py-3 text-sm font-black text-ink transition hover:border-royal hover:text-royal dark:border-white/10 dark:text-white" type="button" (click)="continueWithGoogle()" [disabled]="loading()">
            <span class="grid h-6 w-6 place-items-center rounded-full bg-white text-sm text-royal">G</span>
            Continue with Google
          </button>

          <div class="relative mb-5">
            <div class="absolute inset-0 flex items-center"><span class="w-full border-t border-purple-100 dark:border-white/10"></span></div>
            <div class="relative flex justify-center text-xs uppercase tracking-[0.24em]"><span class="bg-white px-3 text-slate-500 dark:bg-[#12081f]">or</span></div>
          </div>

          @if (isRegister()) {
            <input class="input" name="name" [(ngModel)]="name" placeholder="Full name" required>
            <input class="input mt-4" name="phone" [(ngModel)]="phone" placeholder="Phone optional">
            @if (accountType() === 'provider') {
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <input class="input" name="companyName" [(ngModel)]="companyName" placeholder="Company name">
                <input class="input" name="website" [(ngModel)]="website" placeholder="Website">
              </div>
            }
          }

          <input class="input mt-4" type="email" name="email" [(ngModel)]="email" placeholder="Email" required>

          @if (authMethod() === 'password') {
            <input class="input mt-4" type="password" name="password" [(ngModel)]="password" placeholder="Password" required>
            @if (isRegister()) {
              <input class="input mt-4" name="adminCode" [(ngModel)]="adminCode" placeholder="Admin code optional">
            }
          } @else {
            <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input class="input" name="code" [(ngModel)]="code" placeholder="6-digit code" inputmode="numeric" maxlength="6">
              <button class="btn-secondary px-5 py-3" type="button" (click)="sendEmailCode()" [disabled]="loading()">
                {{ codeSent() ? 'Resend' : 'Send code' }}
              </button>
            </div>
            @if (devCode()) {
              <button class="mt-3 w-full rounded-lg bg-emerald-50 px-4 py-3 text-left text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200" type="button" (click)="useDevCode()">
                Mock email code: {{ devCode() }}
              </button>
            }
          }

          <button class="btn-primary mt-6 w-full" type="submit" [disabled]="loading()">
            {{ loading() ? 'Please wait...' : submitLabel() }}
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
  readonly accountType = signal<AccountType>('client');
  readonly authMethod = signal<'password' | 'code'>('password');
  readonly codeSent = signal(false);
  readonly devCode = signal('');

  name = '';
  email = '';
  password = '';
  code = '';
  phone = '';
  companyName = '';
  website = '';
  adminCode = '';
  returnUrl = '/shop';

  ngOnInit() {
    this.isRegister.set(this.router.url.startsWith('/register'));
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/shop';
  }

  submit() {
    if (this.authMethod() === 'code') {
      this.verifyEmailCode();
      return;
    }

    this.loading.set(true);
    const request = this.isRegister()
      ? this.auth.register({
        name: this.name,
        email: this.email,
        password: this.password,
        accountType: this.accountType(),
        phone: this.phone || undefined,
        companyName: this.companyName || undefined,
        website: this.website || undefined,
        adminCode: this.adminCode || undefined
      })
      : this.auth.login({ email: this.email, password: this.password });

    request.subscribe({
      next: () => this.completeSignIn(),
      error: (error) => {
        this.loading.set(false);
        this.toast.show(error.error?.message || 'Authentication failed', 'error');
      }
    });
  }

  sendEmailCode() {
    if (!this.email || (this.isRegister() && !this.name)) {
      this.toast.show('Add your email and name first', 'info');
      return;
    }

    this.loading.set(true);
    this.auth.requestEmailCode(this.codePayload()).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.codeSent.set(true);
        this.devCode.set(response.devCode || '');
        this.toast.show('Verification code sent', 'success');
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.show(error.error?.message || 'Could not send code', 'error');
      }
    });
  }

  verifyEmailCode() {
    if (!this.codeSent()) {
      this.toast.show('Send a code first', 'info');
      return;
    }

    if (!this.code || this.code.length !== 6) {
      this.toast.show('Enter the 6-digit code', 'info');
      return;
    }

    this.loading.set(true);
    this.auth.verifyEmailCode({ ...this.codePayload(), code: this.code }).subscribe({
      next: () => this.completeSignIn(),
      error: (error) => {
        this.loading.set(false);
        this.toast.show(error.error?.message || 'Invalid code', 'error');
      }
    });
  }

  continueWithGoogle() {
    if (!environment.googleClientId) {
      this.toast.show('Google sign-in needs GOOGLE_CLIENT_ID before launch', 'info');
      return;
    }

    this.loading.set(true);
    this.loadGoogleIdentity().then(() => {
      window.google?.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response) => {
          if (!response.credential) {
            this.loading.set(false);
            this.toast.show('Google did not return a credential', 'error');
            return;
          }

          this.auth.continueWithGoogle({ idToken: response.credential, accountType: this.accountType() }).subscribe({
            next: () => this.completeSignIn(),
            error: (error) => {
              this.loading.set(false);
              this.toast.show(error.error?.message || 'Google sign-in failed', 'error');
            }
          });
        }
      });

      window.google?.accounts.id.prompt((notification) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          this.loading.set(false);
        }
      });
    }).catch(() => {
      this.loading.set(false);
      this.toast.show('Could not load Google sign-in', 'error');
    });
  }

  switchMethod(method: 'password' | 'code') {
    this.authMethod.set(method);
    this.codeSent.set(false);
    this.devCode.set('');
    this.code = '';
  }

  useDevCode() {
    this.code = this.devCode();
  }

  submitLabel() {
    if (this.authMethod() === 'code') {
      return this.isRegister() ? 'Verify & create account' : 'Verify & login';
    }

    return this.isRegister() ? 'Create account' : 'Login';
  }

  private codePayload() {
    return {
      email: this.email,
      mode: this.isRegister() ? 'register' as const : 'login' as const,
      name: this.isRegister() ? this.name : undefined,
      accountType: this.isRegister() ? this.accountType() : undefined,
      phone: this.isRegister() ? this.phone || undefined : undefined,
      companyName: this.isRegister() ? this.companyName || undefined : undefined,
      website: this.isRegister() ? this.website || undefined : undefined
    };
  }

  private completeSignIn() {
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
  }

  private loadGoogleIdentity() {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }
}
