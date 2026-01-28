import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Openings } from './openings';

describe('Openings', () => {
  let component: Openings;
  let fixture: ComponentFixture<Openings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Openings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Openings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
