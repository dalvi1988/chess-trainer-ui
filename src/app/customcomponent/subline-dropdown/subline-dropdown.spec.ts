import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SublineDropdownComponent } from './subline-dropdown';

describe('SublineDropdown', () => {
  let component: SublineDropdownComponent;
  let fixture: ComponentFixture<SublineDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SublineDropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SublineDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
