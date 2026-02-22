import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-subline-dropdown',
  templateUrl: './subline-dropdown.html',
  styleUrls: ['./subline-dropdown.css'],
})
export class SublineDropdownComponent {
  @Input() subLines: any[] = [];
  @Input() selectedLine: any = null;

  // NEW: Completed variation IDs
  @Input() completedIds: number[] = [];

  @Output() lineSelected = new EventEmitter<any>();

  open = false;
  selectedIndex = 0;

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

  // NEW: Check if variation is completed
  isCompleted(id: number | null | undefined): boolean {
    if (!id) return false;
    return this.completedIds.includes(id);
  }
}
