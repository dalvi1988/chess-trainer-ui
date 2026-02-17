import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-evaluation-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-bar.html',
  styleUrls: ['./evaluation-bar.css'],
})
export class EvaluationBarComponent {
  @Input() evalCp: number | null = null; // centipawns
  @Input() evalMate: number | null = null; // mate in N
  @Input() orientation: 'white' | 'black' = 'white';
  get whitePercentage(): number {
    // Mate overrides everything
    if (this.evalMate !== null) {
      const pct = this.evalMate > 0 ? 100 : 0;
      return this.orientation === 'white' ? pct : 100 - pct;
    }

    if (this.evalCp === null) return 50;

    const capped = Math.max(-500, Math.min(500, this.evalCp));
    const pct = ((capped + 500) / 1000) * 100;

    // Flip if black is on top
    return this.orientation === 'white' ? pct : 100 - pct;
  }

  get displayEval(): string {
    if (this.evalMate !== null) {
      return this.evalMate > 0 ? `M${this.evalMate}` : `M${-this.evalMate}`;
    }

    if (this.evalCp !== null) {
      const cp = this.evalCp / 100;
      const formatted = cp.toFixed(1);
      return cp > 0 ? `+${formatted}` : formatted;
    }

    return '';
  }
}
