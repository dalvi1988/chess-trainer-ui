import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private user$ = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  setUser(user: any) {
    this.user$.next(user);
  }

  getUser() {
    return this.user$.asObservable();
  }

  // ⭐ Restore user session after page refresh
  autoLogin() {
    return this.http.get<any>('http://localhost:8080/api/me', {
      withCredentials: true,
    });
  }
}
