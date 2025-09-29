import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlergiaPage } from './alergia.page';

describe('AlergiaPage', () => {
  let component: AlergiaPage;
  let fixture: ComponentFixture<AlergiaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlergiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
