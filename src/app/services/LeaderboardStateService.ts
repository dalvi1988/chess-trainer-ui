import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardUser } from '../models/LeaderboardUser';
import { LoginService } from './login.service';

@Injectable({ providedIn: 'root' })
export class LeaderboardStateService {
  daily$ = new BehaviorSubject<LeaderboardUser[]>([]);
  allTime$ = new BehaviorSubject<LeaderboardUser[]>([]);

  constructor(
    private leaderboardService: LeaderboardService,
    private loginService: LoginService,
  ) {}

  refresh(openingId: number) {
    this.leaderboardService.getLeaderboard(openingId).subscribe((data) => {
      const currentUser = this.loginService.getCurrentUser();

      // DAILY
      let daily = data.daily.map((u) => ({
        ...u,
        dailyStreak: u.dailyStreak ?? 0,
        allTimeStreak: u.allTimeStreak ?? 0,
        isCurrentUser: currentUser ? u.name === currentUser.name : false,
      }));

      // Only add synthetic row if we actually have a current user with a name
      if (currentUser?.name && !daily.some((u) => u.name === currentUser.name)) {
        daily = [
          ...daily,
          {
            name: currentUser.name,
            dailyStreak: 0,
            allTimeStreak: 0,
            isCurrentUser: true,
          },
        ];
      }

      // ALL‑TIME
      let allTime = data.allTime.map((u) => ({
        ...u,
        dailyStreak: u.dailyStreak ?? 0,
        allTimeStreak: u.allTimeStreak ?? 0,
        isCurrentUser: currentUser ? u.name === currentUser.name : false,
      }));

      if (currentUser?.name && !allTime.some((u) => u.name === currentUser.name)) {
        allTime = [
          ...allTime,
          {
            name: currentUser.name,
            dailyStreak: 0,
            allTimeStreak: 0,
            isCurrentUser: true,
          },
        ];
      }

      this.daily$.next(daily);
      this.allTime$.next(allTime);
    });
  }
}
