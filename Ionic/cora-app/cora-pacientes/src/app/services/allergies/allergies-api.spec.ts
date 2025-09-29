import { TestBed } from '@angular/core/testing';

import { AllergiesApi } from './allergies-api';

describe('AllergiesApi', () => {
  let service: AllergiesApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllergiesApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
