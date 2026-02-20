import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { LoginService } from '../../services/login.service';

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

  constructor(private loginService: LoginService) {}

  ngOnInit() {
    this.loginService.getUser().subscribe((u: any) => {
      this.user = u;
    });
  }

  logout() {
    this.loginService.setUser(null);

    this.loginService.logout().subscribe({
      next: () => (window.location.href = '/'),
      error: () => (window.location.href = '/'),
    });
  }
}
