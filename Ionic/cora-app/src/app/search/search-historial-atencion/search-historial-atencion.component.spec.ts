import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchHistorialAtencionComponent } from './search-historial-atencion.component';

describe('SearchHistorialAtencionComponent', () => {
  let component: SearchHistorialAtencionComponent;
  let fixture: ComponentFixture<SearchHistorialAtencionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchHistorialAtencionComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchHistorialAtencionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
