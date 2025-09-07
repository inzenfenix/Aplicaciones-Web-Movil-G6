import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TomySPage } from './ts-pages.page';

describe('TabsPage', () => {
  let component: TomySPage;
  let fixture: ComponentFixture<TomySPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TomySPage],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TomySPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
