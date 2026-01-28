import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [MatCard, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  loginWithGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  loginWithFacebook() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/facebook';
  }
}
