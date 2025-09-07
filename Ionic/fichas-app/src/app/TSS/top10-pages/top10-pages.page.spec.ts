import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Top10PagesPage } from './top10-pages.page';

describe('Top10PagesPage', () => {
  let component: Top10PagesPage;
  let fixture: ComponentFixture<Top10PagesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Top10PagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
