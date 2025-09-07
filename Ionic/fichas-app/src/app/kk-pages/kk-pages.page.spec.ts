import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { KKPage } from './kk-pages.page';

describe('KKPage', () => {
  let component: KKPage;
  let fixture: ComponentFixture<KKPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KKPage],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KKPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
