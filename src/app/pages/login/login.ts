import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [MatCard, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private backendURL = environment.apiUrl;
  returnUrl: string = '/';

  constructor(private route: ActivatedRoute) {} // <-- FIX

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
  }

  loginWithGoogle() {
    window.location.href = `${this.backendURL}/api/auth/oauth2/google?returnUrl=${encodeURIComponent(this.returnUrl)}`;
  }

  loginWithFacebook() {
    window.location.href = `${this.backendURL}/api/auth/oauth2/facebook?returnUrl=${encodeURIComponent(this.returnUrl)}`;
  }
}
