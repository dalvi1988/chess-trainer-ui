import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Openingdetails } from './openingdetails';

describe('Openingdetails', () => {
  let component: Openingdetails;
  let fixture: ComponentFixture<Openingdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Openingdetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Openingdetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
