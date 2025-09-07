import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionsAndSheetsPage } from './actions-and-sheets.page';

describe('ActionsAndSheetsPage', () => {
  let component: ActionsAndSheetsPage;
  let fixture: ComponentFixture<ActionsAndSheetsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsAndSheetsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
