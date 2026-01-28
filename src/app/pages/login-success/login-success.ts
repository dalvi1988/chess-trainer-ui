import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-login-success',
  template: `<p>Logging you in...</p>`,
})
export class LoginSuccess implements OnInit {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.http
      .get<User>('http://localhost:8080/api/me', { withCredentials: true })
      .subscribe((user) => {
        console.log('LoginSuccess received user:', user);
        this.userService.setUser(user);
        this.router.navigate(['/']);
      });
  }
}
