import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LunaPage } from './luna.page';

describe('LunaPage', () => {
  let component: LunaPage;
  let fixture: ComponentFixture<LunaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LunaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
