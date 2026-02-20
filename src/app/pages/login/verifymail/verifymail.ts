import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verifymail.html',
  styleUrls: ['./verifymail.css'],
})
export class VerifyEmail implements OnInit {
  message = 'Verifying your email...';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private loginService: LoginService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.message = 'Invalid verification link.';
      return;
    }

    this.loginService.verifyEmail(token).subscribe({
      next: (res) => (this.message = res),
      error: (err) => (this.message = err.error?.text || err.error || 'Verification failed.'),
    });
  }
}
