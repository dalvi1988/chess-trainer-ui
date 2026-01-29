import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';

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
    private auth: UserService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.message = 'Invalid verification link.';
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: (res) => (this.message = res),
      error: (err) => (this.message = err.error?.text || err.error || 'Verification failed.'),
    });
  }
}
