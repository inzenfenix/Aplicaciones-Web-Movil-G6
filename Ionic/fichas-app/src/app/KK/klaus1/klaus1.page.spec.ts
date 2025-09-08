import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Klaus1Page } from './klaus1.page';

describe('Klaus1Page', () => {
  let component: Klaus1Page;
  let fixture: ComponentFixture<Klaus1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Klaus1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
