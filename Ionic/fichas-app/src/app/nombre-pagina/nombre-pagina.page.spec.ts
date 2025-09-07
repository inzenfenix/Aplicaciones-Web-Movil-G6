import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NombrePaginaPage } from './nombre-pagina.page';

describe('NombrePaginaPage', () => {
  let component: NombrePaginaPage;
  let fixture: ComponentFixture<NombrePaginaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NombrePaginaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
