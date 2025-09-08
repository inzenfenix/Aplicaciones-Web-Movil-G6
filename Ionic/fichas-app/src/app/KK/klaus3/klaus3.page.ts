import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonModal, IonButtons, IonList, IonItem, IonAvatar, IonImg, IonLabel} from '@ionic/angular/standalone';

@Component({
  selector: 'app-klaus3',
  templateUrl: './klaus3.page.html',
  styleUrls: ['./klaus3.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonModal, IonButtons, IonList, IonItem, IonAvatar, IonImg, IonLabel ]
})
export class Klaus3Page implements OnInit {
  presentingElement!: HTMLElement | null;


  constructor() { }

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
  }

}
