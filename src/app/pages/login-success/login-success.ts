import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

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
    this.userService.loginSuccess().subscribe((user) => {
      this.userService.setUser(user);
      this.router.navigate(['/']);
    });
  }
}
