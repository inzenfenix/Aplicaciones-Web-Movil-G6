import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToDoListPage } from './to-do-list.page';

describe('ToDoListPage', () => {
  let component: ToDoListPage;
  let fixture: ComponentFixture<ToDoListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ToDoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
