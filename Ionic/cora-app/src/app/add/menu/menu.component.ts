import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonNavLink,
  IonButton,
} from '@ionic/angular/standalone';
import {
  BookOpenCheck,
  LucideAngularModule,
  NotebookText,
} from 'lucide-angular';
import { ExamenMedicoComponent } from '../examen-medico/examen-medico.component';
import { AtencionMedicaComponent } from '../atencion-medica/atencion-medica.component';

@Component({
  selector: 'app-add-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [
    IonButton,
    IonNavLink,
    IonCardTitle,
    IonCardContent,
    IonCard,
    IonCol,
    IonRow,
    IonGrid,
    IonTitle,
    IonContent,
    IonHeader,
    IonToolbar,
    [LucideAngularModule],
  ],
})
export class MenuComponent implements OnInit {
  examenes = ExamenMedicoComponent;
  examIcon = BookOpenCheck;

  atenciones = AtencionMedicaComponent;
  atentionIcon = NotebookText;

  constructor() {}

  ngOnInit() {}
}
