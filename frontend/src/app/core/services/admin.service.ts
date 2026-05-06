import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product, User } from '../models';

export interface SalesStats {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  productCount: number;
  userCount: number;
  byDay: { _id: string; revenue: number; orders: number }[];
  topProducts: Product[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  stats() {
    return this.http.get<SalesStats>(`${environment.apiUrl}/stats`);
  }

  users() {
    return this.http.get<{ users: User[] }>(`${environment.apiUrl}/users`);
  }
}

