import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Opening } from '../models/openings';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OpeningsService {
  private backendURL = environment.apiUrl;
  private api = `${this.backendURL}/api/openings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Opening[]> {
    return this.http.get<Opening[]>(this.api, {
      withCredentials: true,
    });
  }

  getById(id: number): Observable<Opening> {
    return this.http.get<Opening>(`${this.api}/${id}`, {
      withCredentials: true,
    });
  }
  getByName(name: String): Observable<Opening> {
    return this.http.get<Opening>(`${this.api}/${name}`, {
      withCredentials: true,
    });
  }
}
