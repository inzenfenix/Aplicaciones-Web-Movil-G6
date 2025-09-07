import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputStuffPage } from './input-stuff.page';

describe('InputStuffPage', () => {
  let component: InputStuffPage;
  let fixture: ComponentFixture<InputStuffPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InputStuffPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
