import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Opening } from '../models/openings';

@Injectable({
  providedIn: 'root',
})
export class OpeningsService {
  private api = 'http://localhost:8080/api/openings';

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
}
