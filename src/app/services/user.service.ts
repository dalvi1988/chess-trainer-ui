import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private backendURL = environment.apiUrl;
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
    return this.http.get<any>(`${this.backendURL}/api/me`, {
      withCredentials: true,
    });
  }

  login(email: string, password: string) {
    return this.http.post(
      `${this.backendURL}/api/login`,
      { email, password },
      { responseType: 'text', withCredentials: true },
    );
  }

  signup(name: string, email: string, password: string) {
    return this.http.post(
      `${this.backendURL}/api/auth/signup`,
      { name, email, password },
      { responseType: 'text', withCredentials: true },
    );
  }

  verifyEmail(token: string) {
    return this.http.get(`${this.backendURL}/api/verify-email?token=${token}`, {
      responseType: 'text',
    });
  }

  loginSuccess() {
    return this.http.get(`${this.backendURL}/api/me`, { withCredentials: true });
  }

  logout() {
    return this.http.post(
      `${environment.apiUrl}/logout`,
      {},
      {
        withCredentials: true,
      },
    );
  }
}
