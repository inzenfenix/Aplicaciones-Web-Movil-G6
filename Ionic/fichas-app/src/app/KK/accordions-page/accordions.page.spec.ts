import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionsPage } from './accordions.page';

describe('AccordionsPage', () => {
  let component: AccordionsPage;
  let fixture: ComponentFixture<AccordionsPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(AccordionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
