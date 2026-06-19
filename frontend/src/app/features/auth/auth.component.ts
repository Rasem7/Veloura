import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AccountType } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';
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
              <p class="text-xs font-black uppercase tracking-[0.34em] text-champagne">{{ language.t('auth.account') }}</p>
              <h1 class="mt-3 text-4xl font-black">{{ isRegister() ? language.t('auth.createProfile') : language.t('auth.welcomeBack') }}</h1>
              <p class="mt-4 max-w-sm text-sm leading-6 text-purple-100">{{ language.t('auth.subtitle') }}</p>
            </div>
            <div class="grid gap-3 text-sm sm:grid-cols-3">
              <div class="border border-white/15 bg-white/10 p-3 backdrop-blur">
                <p class="font-black">{{ language.t('auth.secure') }}</p>
                <p class="mt-1 text-xs text-purple-100">{{ language.t('auth.jwt') }}</p>
              </div>
              <div class="border border-white/15 bg-white/10 p-3 backdrop-blur">
                <p class="font-black">{{ language.t('auth.instant') }}</p>
                <p class="mt-1 text-xs text-purple-100">{{ language.t('auth.emailCode') }}</p>
              </div>
              <div class="border border-white/15 bg-white/10 p-3 backdrop-blur">
                <p class="font-black">{{ language.t('auth.ready') }}</p>
                <p class="mt-1 text-xs text-purple-100">{{ language.t('auth.googleAuth') }}</p>
              </div>
            </div>
          </div>
        </div>

        <form class="p-6 sm:p-8" (ngSubmit)="submit()">
          @if (isRegister()) {
            <div class="mb-5 grid grid-cols-2 gap-2 rounded-full bg-purple-50 p-1 dark:bg-white/8">
              <button class="rounded-full px-4 py-3 text-sm font-black transition" type="button" [class.bg-white]="accountType() === 'client'" [class.text-royal]="accountType() === 'client'" [class.shadow]="accountType() === 'client'" (click)="accountType.set('client')">{{ language.t('auth.client') }}</button>
              <button class="rounded-full px-4 py-3 text-sm font-black transition" type="button" [class.bg-white]="accountType() === 'provider'" [class.text-royal]="accountType() === 'provider'" [class.shadow]="accountType() === 'provider'" (click)="accountType.set('provider')">{{ language.t('auth.provider') }}</button>
            </div>
          }

          <div class="mb-5 grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1 dark:bg-white/8">
            <button class="rounded-full px-4 py-3 text-sm font-black transition" type="button" [class.bg-white]="authMethod() === 'password'" [class.text-royal]="authMethod() === 'password'" [class.shadow]="authMethod() === 'password'" (click)="switchMethod('password')">{{ language.t('auth.email') }}</button>
            <button class="rounded-full px-4 py-3 text-sm font-black transition" type="button" [class.bg-white]="authMethod() === 'code'" [class.text-royal]="authMethod() === 'code'" [class.shadow]="authMethod() === 'code'" (click)="switchMethod('code')">{{ language.t('auth.code') }}</button>
          </div>

          <button class="mb-5 flex w-full items-center justify-center gap-3 rounded-full border border-purple-100 px-5 py-3 text-sm font-black text-ink transition hover:border-royal hover:text-royal dark:border-white/10 dark:text-white" type="button" (click)="continueWithGoogle()" [disabled]="loading()">
            <span class="grid h-6 w-6 place-items-center rounded-full bg-white text-sm text-royal">G</span>
            {{ language.t('auth.google') }}
          </button>

          <div class="relative mb-5">
            <div class="absolute inset-0 flex items-center"><span class="w-full border-t border-purple-100 dark:border-white/10"></span></div>
            <div class="relative flex justify-center text-xs uppercase tracking-[0.24em]"><span class="bg-white px-3 text-slate-500 dark:bg-[#12081f]">{{ language.t('auth.or') }}</span></div>
          </div>

          @if (isRegister()) {
            <input class="input" name="name" [(ngModel)]="name" [placeholder]="language.t('auth.fullName')" required>
            <input class="input mt-4" name="phone" [(ngModel)]="phone" [placeholder]="language.t('auth.phone')">
            @if (accountType() === 'provider') {
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <input class="input" name="companyName" [(ngModel)]="companyName" [placeholder]="language.t('auth.company')">
                <input class="input" name="website" [(ngModel)]="website" [placeholder]="language.t('auth.website')">
              </div>
            }
          }

          <input class="input mt-4" type="email" name="email" [(ngModel)]="email" [placeholder]="language.t('auth.email')" required>

          @if (authMethod() === 'password') {
            <input class="input mt-4" type="password" name="password" [(ngModel)]="password" [placeholder]="language.t('auth.password')" required>
            @if (isRegister()) {
              <input class="input mt-4" name="adminCode" [(ngModel)]="adminCode" [placeholder]="language.t('auth.adminCode')">
            }
          } @else {
            <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input class="input" name="code" [(ngModel)]="code" [placeholder]="language.t('auth.sixCode')" inputmode="numeric" maxlength="6">
              <button class="btn-secondary px-5 py-3" type="button" (click)="sendEmailCode()" [disabled]="loading()">
                {{ codeSent() ? language.t('auth.resend') : language.t('auth.sendCode') }}
              </button>
            </div>
            @if (devCode()) {
              <button class="mt-3 w-full rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200" [class.text-right]="language.isArabic()" [class.text-left]="!language.isArabic()" type="button" (click)="useDevCode()">
                <span class="block">{{ language.t('auth.mockCode') }}: {{ devCode() }}</span>
                <span class="mt-1 block text-xs font-semibold opacity-80">{{ language.t('auth.mockHint') }}</span>
              </button>
            }
          }

          <button class="btn-primary mt-6 w-full" type="submit" [disabled]="loading()">
            {{ loading() ? language.t('auth.wait') : submitLabel() }}
          </button>

          @if (isRegister()) {
            <p class="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">{{ language.t('auth.haveAccount') }} <a routerLink="/login" class="font-bold text-royal">{{ language.t('auth.login') }}</a></p>
          } @else {
            <p class="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">{{ language.t('auth.newHere') }} <a routerLink="/register" class="font-bold text-royal">{{ language.t('auth.createAccount') }}</a></p>
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
  readonly language = inject(LanguageService);
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
        this.toast.show(error.error?.message || this.language.t('auth.authFailed'), 'error');
      }
    });
  }

  sendEmailCode() {
    if (!this.email || (this.isRegister() && !this.name)) {
      this.toast.show(this.language.t('auth.addEmailName'), 'info');
      return;
    }

    this.loading.set(true);
    this.auth.requestEmailCode(this.codePayload()).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.codeSent.set(true);
        this.devCode.set(response.devCode || '');
        if (response.devCode) {
          this.code = response.devCode;
          this.toast.show(this.language.t('auth.codeReady'), 'success');
          return;
        }

        this.toast.show(this.language.t('auth.codeSent'), 'success');
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.show(error.error?.message || this.language.t('auth.couldNotSend'), 'error');
      }
    });
  }

  verifyEmailCode() {
    if (!this.codeSent()) {
      this.toast.show(this.language.t('auth.sendCodeFirst'), 'info');
      return;
    }

    if (!this.code || this.code.length !== 6) {
      this.toast.show(this.language.t('auth.enterCode'), 'info');
      return;
    }

    this.loading.set(true);
    this.auth.verifyEmailCode({ ...this.codePayload(), code: this.code }).subscribe({
      next: () => this.completeSignIn(),
      error: (error) => {
        this.loading.set(false);
        this.toast.show(error.error?.message || this.language.t('auth.invalidCode'), 'error');
      }
    });
  }

  continueWithGoogle() {
    if (!environment.googleClientId) {
      this.toast.show(this.language.t('auth.googleNeedsConfig'), 'info');
      return;
    }

    this.loading.set(true);
    this.loadGoogleIdentity().then(() => {
      window.google?.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response) => {
          if (!response.credential) {
            this.loading.set(false);
            this.toast.show(this.language.t('auth.googleCredential'), 'error');
            return;
          }

          this.auth.continueWithGoogle({ idToken: response.credential, accountType: this.accountType() }).subscribe({
            next: () => this.completeSignIn(),
            error: (error) => {
              this.loading.set(false);
              this.toast.show(error.error?.message || this.language.t('auth.googleFailed'), 'error');
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
      this.toast.show(this.language.t('auth.googleLoadFailed'), 'error');
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
      return this.isRegister() ? this.language.t('auth.verifyCreate') : this.language.t('auth.verifyLogin');
    }

    return this.isRegister() ? this.language.t('auth.createAccount') : this.language.t('auth.login');
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
        this.toast.show(this.language.t('auth.signedIn'), 'success');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        this.toast.show(this.language.t('auth.cartRetry'), 'info');
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
