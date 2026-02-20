import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { Toolbar } from './pages/toolbar/toolbar';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, Toolbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  constructor(private loginService: LoginService) {}

  ngOnInit() {
    // ⭐ Restore user session after refresh
    this.loginService.autoLogin().subscribe({
      next: (user) => this.loginService.setUser(user),
      error: () => this.loginService.setUser(null),
    });
  }

  protected readonly title = signal('chess-trainer-ui');
}
