import { TestBed } from '@angular/core/testing';

import { AuthsGuard } from './auths.guard';

describe('AuthsGuard', () => {
  let service: AuthsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthsGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
