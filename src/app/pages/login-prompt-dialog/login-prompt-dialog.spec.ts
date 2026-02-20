import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPromptDialog } from './login-prompt-dialog';

describe('LoginPromptDialog', () => {
  let component: LoginPromptDialog;
  let fixture: ComponentFixture<LoginPromptDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPromptDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPromptDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
