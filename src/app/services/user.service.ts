import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  login(email: string, password: string) {
    return this.http.post(
      'http://localhost:8080/api/login',
      { email, password },
      { responseType: 'text', withCredentials: true },
    );
  }

  signup(name: string, email: string, password: string) {
    return this.http.post(
      'http://localhost:8080/api/auth/signup',
      { name, email, password },
      { responseType: 'text', withCredentials: true },
    );
  }

  verifyEmail(token: string) {
    return this.http.get(`http://localhost:8080/api/verify-email?token=${token}`, {
      responseType: 'text',
    });
  }
}
