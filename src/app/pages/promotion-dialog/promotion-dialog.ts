import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-promotion-dialog',
  templateUrl: './promotion-dialog.html',
  styleUrls: ['./promotion-dialog.css'],
})
export class PromotionDialogComponent {
  constructor(private dialogRef: MatDialogRef<PromotionDialogComponent>) {}

  select(piece: string) {
    this.dialogRef.close(piece); // return selected piece
  }
}
