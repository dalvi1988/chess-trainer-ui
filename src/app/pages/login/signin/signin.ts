import { Component } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './signin.html',
  styleUrls: ['./signin.css'],
})
export class SignIn {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private loginService: LoginService) {}

  login() {
    this.loginService.login(this.email, this.password).subscribe({
      next: (res: string) => {
        window.location.href = '/'; // redirect to home
      },
      error: (err: any) => {
        this.errorMessage = err.error || 'Invalid credentials';
      },
    });
  }
}
