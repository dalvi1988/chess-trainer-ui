import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-prompt-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './login-prompt-dialog.html',
  styleUrls: ['./login-prompt-dialog.css'],
})
export class LoginPromptDialogComponent {
  constructor(private dialogRef: MatDialogRef<LoginPromptDialogComponent>) {}

  login() {
    this.dialogRef.close('login');
  }

  continue() {
    this.dialogRef.close('continue');
  }
}
