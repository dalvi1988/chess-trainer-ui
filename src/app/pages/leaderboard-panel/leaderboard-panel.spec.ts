import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardPanelComponent } from './leaderboard-panel';

describe('LeaderboardPanel', () => {
  let component: LeaderboardPanelComponent;
  let fixture: ComponentFixture<LeaderboardPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
