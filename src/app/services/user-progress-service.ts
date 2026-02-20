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
    alert(`Saving completion for variation ${variationId}...`); // Debug alert
    return this.http.post(`${this.backendURL}/variation`, {
      variationId,
    });
  }
}
