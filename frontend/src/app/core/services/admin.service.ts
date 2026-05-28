import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AccountType, Product, ProviderStatus, Role, User } from '../models';

export interface SalesStats {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  productCount: number;
  userCount: number;
  byDay: { _id: string; revenue: number; orders: number }[];
  topProducts: Product[];
}

export interface UserListParams {
  accountType?: AccountType | 'all';
  role?: Role | 'all';
  status?: 'active' | 'inactive' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  role: Role;
  accountType: AccountType;
  phone?: string;
  companyName?: string;
  website?: string;
  providerStatus?: ProviderStatus;
  isActive?: boolean;
}

export interface UserStats {
  clients: number;
  providers: number;
  active: number;
  disabled: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  stats() {
    return this.http.get<SalesStats>(`${environment.apiUrl}/stats`);
  }

  users(params: UserListParams = {}) {
    const query: Record<string, string> = {};

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === '' || value === 'all') continue;
      query[key] = String(value);
    }

    return this.http.get<UserListResponse>(`${environment.apiUrl}/users`, { params: query });
  }

  userStats() {
    return this.http.get<UserStats>(`${environment.apiUrl}/users/stats`);
  }

  createUser(payload: UserPayload) {
    return this.http.post<{ user: User }>(`${environment.apiUrl}/users`, payload);
  }

  updateUser(id: string, payload: Partial<UserPayload>) {
    return this.http.put<{ user: User }>(`${environment.apiUrl}/users/${id}`, payload);
  }

  deleteUser(id: string) {
    return this.http.delete<{ message: string; user: User }>(`${environment.apiUrl}/users/${id}`);
  }
}
