import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-variation-complete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>🎉 Variation Complete!</h2>

    <mat-dialog-content>
      <p>You played this line perfectly. What would you like to do next?</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button color="warn" (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="next()">Next Variation</button>
    </mat-dialog-actions>
  `,
})
export class VariationCompleteDialog {
  constructor(private dialogRef: MatDialogRef<VariationCompleteDialog>) {}

  next() {
    this.dialogRef.close('next');
  }

  cancel() {
    this.dialogRef.close('cancel');
  }
}
