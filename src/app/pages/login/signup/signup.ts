import { Component } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  name = '';
  email = '';
  password = '';
  message = '';
  error = '';

  constructor(private loginService: LoginService) {}

  signup() {
    this.error = '';
    this.message = '';

    this.loginService.signup(this.name, this.email, this.password).subscribe({
      next: (res: string) => {
        this.message = res;
      },
      error: (err) => {
        this.error = err.error?.text || err.error || 'Signup failed';
      },
    });
  }
}
