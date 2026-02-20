import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginPromptDialogComponent } from '../pages/login-prompt-dialog/login-prompt-dialog';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isDialogOpen = false; // prevents multiple dialogs opening at once

  constructor(
    private dialog: MatDialog,
    private router: Router,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.openLoginPromptDialog();
        }

        return throwError(() => error);
      }),
    );
  }

  private openLoginPromptDialog() {
    if (this.isDialogOpen) return; // avoid duplicates
    this.isDialogOpen = true;

    const dialogRef = this.dialog.open(LoginPromptDialogComponent, {
      width: '320px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((choice) => {
      this.isDialogOpen = false;

      if (choice === 'login') {
        this.router.navigate(['/login']);
      }
      // If user chooses "continue", do nothing
    });
  }
}
