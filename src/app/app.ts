import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { Toolbar } from './pages/toolbar/toolbar';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, Toolbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  constructor(private userService: UserService) {}

  ngOnInit() {
    // ⭐ Restore user session after refresh
    this.userService.autoLogin().subscribe({
      next: (user) => this.userService.setUser(user),
      error: () => this.userService.setUser(null),
    });
  }

  protected readonly title = signal('chess-trainer-ui');
}
