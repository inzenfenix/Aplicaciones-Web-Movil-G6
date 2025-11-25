import { TestBed } from '@angular/core/testing';

import { RecipeApi } from './recipe-api';

describe('RecipeApi', () => {
  let service: RecipeApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
