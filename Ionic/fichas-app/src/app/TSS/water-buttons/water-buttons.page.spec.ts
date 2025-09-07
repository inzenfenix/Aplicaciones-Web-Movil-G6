import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaterButtonsPage } from './water-buttons.page';

describe('WaterButtonsPage', () => {
  let component: WaterButtonsPage;
  let fixture: ComponentFixture<WaterButtonsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterButtonsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
