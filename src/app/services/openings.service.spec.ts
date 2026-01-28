import { TestBed } from '@angular/core/testing';

import { OpeningsService } from './openings.service';

describe('OpeningsService', () => {
  let service: OpeningsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpeningsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
