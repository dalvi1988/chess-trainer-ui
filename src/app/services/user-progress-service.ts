import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class UserProgressService {
  private backendURL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Save completion of an opening variation
   */
  saveVariationCompletion(variationId: number | null): Observable<any> {
    return this.http.post(
      `${this.backendURL}/api/user/progress/saveVariation`,
      { variationId },
      { withCredentials: true },
    );
  }

  /**
   * Fetch all completed variation IDs for the logged‑in user
   */
  getCompletedVariationIds(): Observable<number[]> {
    return this.http.get<number[]>(
      `${this.backendURL}/api/user/progress/getCompletedVariationIds`,
      {
        withCredentials: true,
      },
    );
  }
}
