import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-login',
  imports: [MatCard, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private backendURL = environment.apiUrl;
  loginWithGoogle() {
    window.location.href = `${this.backendURL}/oauth2/authorization/google`;
  }

  loginWithFacebook() {
    window.location.href = `${this.backendURL}/oauth2/authorization/facebook`;
  }
}
