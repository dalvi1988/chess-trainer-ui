import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Drill } from './drill';

describe('Drill', () => {
  let component: Drill;
  let fixture: ComponentFixture<Drill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Drill]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Drill);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
