import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccountType, User } from '../models';

interface AuthResponse {
  user: User;
  token: string;
}

export interface EmailCodeResponse {
  message: string;
  expiresInMinutes: number;
  devCode?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'veloura_token';
  private readonly userKey = 'veloura_user';

  readonly token = signal<string | null>(localStorage.getItem(this.tokenKey));
  readonly user = signal<User | null>(this.readStoredUser());
  readonly isAuthenticated = computed(() => Boolean(this.token()));
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  register(payload: { name: string; email: string; password: string; accountType?: AccountType; phone?: string; companyName?: string; website?: string; adminCode?: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  login(payload: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  requestEmailCode(payload: { email: string; mode: 'login' | 'register'; name?: string; accountType?: AccountType; phone?: string; companyName?: string; website?: string }) {
    return this.http.post<EmailCodeResponse>(`${environment.apiUrl}/auth/code/request`, payload);
  }

  verifyEmailCode(payload: { email: string; code: string; mode: 'login' | 'register'; name?: string; accountType?: AccountType; phone?: string; companyName?: string; website?: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/code/verify`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  continueWithGoogle(payload: { idToken: string; accountType?: AccountType }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.token.set(null);
    this.user.set(null);
  }

  private setSession(response: AuthResponse) {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.token.set(response.token);
    this.user.set(response.user);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
