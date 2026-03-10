import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaderboardUser } from '../models/LeaderboardUser';
import { environment } from '../../environments/environment';

export interface LeaderboardResponse {
  daily: LeaderboardUser[];
  allTime: LeaderboardUser[];
}

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private backendURL = environment.apiUrl;
  private apiUrl = `${this.backendURL}/api/leaderboard`;

  constructor(private http: HttpClient) {}

  // Fetch leaderboard for a specific opening
  getLeaderboard(openingId: number): Observable<LeaderboardResponse> {
    return this.http.get<LeaderboardResponse>(`${this.apiUrl}/${openingId}`);
  }

  // Update streak for a specific opening
  updateStreak(openingId: number, score: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/update`,
      { openingId, score },
      { withCredentials: true },
    );
  }
}
