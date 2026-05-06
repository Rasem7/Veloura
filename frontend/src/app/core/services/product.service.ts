import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product, ProductListResponse, Review } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  getProducts(filters: Record<string, string | number | undefined> = {}) {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }

    return this.http.get<ProductListResponse>(`${environment.apiUrl}/products`, { params });
  }

  getProduct(slugOrId: string, sessionId: string) {
    return this.http.get<{ product: Product }>(`${environment.apiUrl}/products/${slugOrId}`, {
      params: { sessionId }
    });
  }

  createProduct(payload: Partial<Product>) {
    return this.http.post<{ product: Product }>(`${environment.apiUrl}/products`, payload);
  }

  updateProduct(id: string, payload: Partial<Product>) {
    return this.http.put<{ product: Product }>(`${environment.apiUrl}/products/${id}`, payload);
  }

  deleteProduct(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`);
  }

  getReviews(productId: string) {
    return this.http.get<{ reviews: Review[] }>(`${environment.apiUrl}/products/${productId}/reviews`);
  }

  addReview(productId: string, payload: { rating: number; title?: string; comment?: string }) {
    return this.http.post<{ review: Review }>(`${environment.apiUrl}/products/${productId}/reviews`, payload);
  }

  trackInteraction(productId: string, type: 'view' | 'click' | 'cart', sessionId: string) {
    return this.http.post(`${environment.apiUrl}/interactions`, { productId, type, sessionId });
  }
}

