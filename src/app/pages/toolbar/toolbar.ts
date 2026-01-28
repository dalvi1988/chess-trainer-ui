import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.css'],
})
export class Toolbar implements OnInit {
  user: any = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUser().subscribe((u) => (this.user = u));
  }

  logout() {
    // Clear Angular state
    this.userService.setUser(null);

    // Clear backend session
    fetch('http://localhost:8080/logout', {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      window.location.href = '/';
    });
  }
}
