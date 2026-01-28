import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { OpeningsService } from '../../services/openings.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-openings',
  standalone: true,
  imports: [MatCardModule, RouterLink, MatButtonModule, FormsModule, NgClass],
  templateUrl: './openings.html',
  styleUrl: './openings.css',
})
export class Openings {
  openings: any[] = [];

  constructor(private openingsService: OpeningsService) {}

  ngOnInit() {
    this.openingsService.getAll().subscribe((data: any[]) => {
      this.openings = data;
    });
  }

  searchTerm: string = '';
  filterSide: 'all' | 'white' | 'black' = 'all';

  filteredOpenings() {
    const term = this.searchTerm?.toLowerCase() ?? '';

    return this.openings.filter((o) => {
      // SIDE FILTER
      const matchesSide = this.filterSide === 'all' || o.side === this.filterSide;

      // SEARCH FILTER
      const matchesSearch =
        !term ||
        o.name.toLowerCase().includes(term) ||
        o.description.toLowerCase().includes(term) ||
        (o.eco && o.eco.toLowerCase().includes(term));

      return matchesSide && matchesSearch;
    });
  }
}
