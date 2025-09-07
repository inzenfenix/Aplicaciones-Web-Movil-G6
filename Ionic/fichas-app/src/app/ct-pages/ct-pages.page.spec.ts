import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { KKPage as CTPage } from './ct-pages.page';

describe('CTPage', () => {
  let component: CTPage;
  let fixture: ComponentFixture<CTPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CTPage],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CTPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
