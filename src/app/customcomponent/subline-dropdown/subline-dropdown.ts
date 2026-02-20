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

  selectedIndex: number = 0;

  toggle() {
    this.open = !this.open;
  }

  select(line: any, index: number) {
    this.selectedLine = line;
    this.selectedIndex = index;
    this.lineSelected.emit(line);
    this.open = false;
  }

  shortMoves(moves: string | string[]): string {
    if (!moves) return '';
    return Array.isArray(moves) ? moves.join(' ') : moves;
  }
}
