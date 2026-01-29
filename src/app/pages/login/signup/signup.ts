import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';
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

  constructor(private auth: UserService) {}

  signup() {
    this.error = '';
    this.message = '';

    this.auth.signup(this.name, this.email, this.password).subscribe({
      next: (res: string) => {
        this.message = res;
      },
      error: (err) => {
        this.error = err.error?.text || err.error || 'Signup failed';
      },
    });
  }
}
