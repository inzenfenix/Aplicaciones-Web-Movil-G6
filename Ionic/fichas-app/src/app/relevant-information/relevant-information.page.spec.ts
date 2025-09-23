import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelevantInformationPage } from './relevant-information.page';

describe('RelevantInformationPage', () => {
  let component: RelevantInformationPage;
  let fixture: ComponentFixture<RelevantInformationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RelevantInformationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
