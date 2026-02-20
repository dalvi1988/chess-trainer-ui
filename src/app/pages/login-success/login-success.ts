import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login-success',
  template: `<p>Logging you in...</p>`,
})
export class LoginSuccess implements OnInit {
  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loginService.loginSuccess().subscribe((login) => {
      this.loginService.setUser(login);
      this.router.navigate(['/']);
    });
  }
}
