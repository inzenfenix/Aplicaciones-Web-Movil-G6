import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar
  ]
})
export class ProfilePage implements OnInit {

  paciente = {
    nombre: 'Jane Doe',
    edad: 28,
    id: '000123456',
    sexo: 'Femenino',
    tipoSangre: 'A+',
    fotoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

  };

  presion = [
    { fecha: '01/09', sistolica: 120, diastolica: 80 },
    { fecha: '05/09', sistolica: 118, diastolica: 78 },
    { fecha: '10/09', sistolica: 122, diastolica: 82 }
  ];

  ultimosExamenes = [
    { examen: 'Hemograma', fecha: '10/09/2025', resultado: 'Normal' },
    { examen: 'Perfil Lipídico', fecha: '05/09/2025', resultado: 'Ligeramente alto' }
  ];

  ordenesMedicas = [
    { orden: 'Control de presión', fecha: '12/09/2025' },
    { orden: 'Ecografía abdominal', fecha: '18/07/2025' }
  ];

  ultimasAtenciones = [
    { tipo: 'Consulta general', fecha: '12/09/2025', profesional: 'Dr. Pérez' },
    { tipo: 'Control de tiroides', fecha: '02/08/2025', profesional: 'Dra. Muñoz' }
  ];

  constructor() { }

  ngOnInit() { }
}
