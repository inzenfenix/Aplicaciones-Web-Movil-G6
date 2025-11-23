import { Component, OnInit } from '@angular/core';
import { IonButton, IonContent, IonHeader, IonNavLink, IonTitle, IonToolbar, IonGrid, IonCol, IonRow, IonCard, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { SearchExamenesComponent } from '../search-examenes/search-examenes.component';
import { SearchHistorialAtencionComponent } from '../search-historial-atencion/search-historial-atencion.component';
import { BookOpenCheck, LucideAngularModule, NotebookText } from 'lucide-angular';

@Component({
  selector: 'app-search-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [
    IonRow,
    IonCol,
    IonGrid,
    IonButton,
    IonContent,
    IonHeader,
    IonNavLink,
    IonTitle,
    IonToolbar,
    [LucideAngularModule],
    IonCard,
    IonCardTitle,
    IonCardContent
],
})
export class MenuComponent implements OnInit {

  examenes = SearchExamenesComponent;
  examIcon = BookOpenCheck;

  atenciones = SearchHistorialAtencionComponent;
  atentionIcon = NotebookText;
  constructor() {}

  ngOnInit() {}
}
