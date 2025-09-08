import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonCard, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCardContent,IonCheckbox, IonItem, IonLabel,IonButton, IonAlert } from '@ionic/angular/standalone';
import { at } from 'ionicons/icons';
import { min } from 'rxjs';

@Component({
  selector: 'app-klaus2',
  templateUrl: './klaus2.page.html',
  styleUrls: ['./klaus2.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonCard, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCardContent, IonCheckbox, IonItem,IonLabel,IonButton, IonAlert]
})
export class Klaus2Page implements OnInit {
  public alertButtons= ['OK'];
  public alertInputs= [
    {
      placeholder: 'Nombre',
      required: true
    },
    {
      placeholder: 'Apellido',
      required: true
    },
    {
      type: 'number',
      placeholder: 'Edad',
      min: 1,
      max: 100,
      required: true
    },
    {
      placeholder: 'Email',
      type: 'email',
      required: true
    }

  ]

  constructor() { }

  ngOnInit() {
  }

}
