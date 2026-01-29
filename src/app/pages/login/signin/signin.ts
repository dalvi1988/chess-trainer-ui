import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';
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

  constructor(private auth: UserService) {}

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (res: string) => {
        window.location.href = '/'; // redirect to home
      },
      error: (err: any) => {
        this.errorMessage = err.error || 'Invalid credentials';
      },
    });
  }
}
