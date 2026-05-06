import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RecommendationResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly http = inject(HttpClient);

  get(userId: string, productId?: string) {
    if (productId) {
      return this.http.get<RecommendationResponse>(`${environment.apiUrl}/recommendations/${userId}`, { params: { productId } });
    }

    return this.http.get<RecommendationResponse>(`${environment.apiUrl}/recommendations/${userId}`);
  }
}
