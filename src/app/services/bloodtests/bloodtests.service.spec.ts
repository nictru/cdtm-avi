import { TestBed } from '@angular/core/testing';

import { BloodtestsService } from './bloodtests.service';

describe('BloodtestsService', () => {
  let service: BloodtestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloodtestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
