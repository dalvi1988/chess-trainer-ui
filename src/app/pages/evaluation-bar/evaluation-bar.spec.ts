import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationBar } from './evaluation-bar';

describe('EvaluationBar', () => {
  let component: EvaluationBar;
  let fixture: ComponentFixture<EvaluationBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
