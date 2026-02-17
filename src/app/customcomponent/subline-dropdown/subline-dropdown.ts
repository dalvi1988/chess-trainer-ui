import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-subline-dropdown',
  templateUrl: './subline-dropdown.html',
  styleUrls: ['./subline-dropdown.css'],
})
export class SublineDropdownComponent {
  @Input() subLines: any[] = [];
  @Input() selectedLine: any = null;

  @Output() lineSelected = new EventEmitter<any>();

  open = false;

  toggle() {
    this.open = !this.open;
  }

  select(line: any) {
    this.selectedLine = line;
    this.lineSelected.emit(line);
    this.open = false;
  }

  // ⭐ FIXED: handles both string and array safely
  shortMoves(moves: string | string[]): string {
    if (!moves) return '';

    // Convert array → string
    const text = Array.isArray(moves) ? moves.join(' ') : moves;

    // Let CSS handle truncation — return full text
    return text;
  }
}
