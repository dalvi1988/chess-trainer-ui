import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'feedback-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback-dialog.html',
  styleUrls: ['./feedback-dialog.css'],
})
export class FeedbackDialogComponent {
  @Input() message = '';
  @Input() type: 'right' | 'wrong' = 'right';
  @Input() visible = false;
}
