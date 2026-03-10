import { Component } from '@angular/core';
import { LeaderboardService } from '../../services/leaderboard.service';
import { LeaderboardStateService } from '../../services/LeaderboardStateService';
import { AsyncPipe } from '@angular/common';

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

  constructor(private state: LeaderboardStateService) {
    this.daily$ = this.state.daily$;
    this.allTime$ = this.state.allTime$;
  }
}
