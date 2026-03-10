import { Component } from '@angular/core';
import { LeaderboardStateService } from '../../services/LeaderboardStateService';
import { AsyncPipe } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'leaderboard-panel',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './leaderboard-panel.html',
  styleUrls: ['./leaderboard-panel.css'],
})
export class LeaderboardPanelComponent {
  daily$;
  allTime$;

  selected: 'daily' | 'all' = 'daily';

  isLoggedIn = false;

  constructor(
    private state: LeaderboardStateService,
    private loginService: LoginService,
    private router: Router,
  ) {
    this.daily$ = this.state.daily$;
    this.allTime$ = this.state.allTime$;

    this.isLoggedIn = this.loginService.getCurrentUser();
    this.loginService.getUser().subscribe((user) => {
      this.isLoggedIn = !!user;
    });
  }
  loginFromLeaderboard() {
    const returnUrl = this.router.url; // capture current page
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }
}
