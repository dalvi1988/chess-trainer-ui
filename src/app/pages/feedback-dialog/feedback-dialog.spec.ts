import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackDialogComponent } from './feedback-dialog';

describe('FeedbackDialog', () => {
  let component: FeedbackDialogComponent;
  let fixture: ComponentFixture<FeedbackDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
