import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonLabel, IonList, IonItem, IonItemSliding, IonAvatar, IonImg, IonItemOptions, IonItemOption, IonIcon,  } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pin, share, trash } from 'ionicons/icons';

@Component({
  selector: 'app-klaus5',
  templateUrl: './klaus5.page.html',
  styleUrls: ['./klaus5.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonLabel, FormsModule, IonList, IonItem, IonItemSliding, IonAvatar, IonImg, IonItemOptions, IonItemOption, IonIcon]
})
export class Klaus5Page implements OnInit {

  constructor() { 
    addIcons({
      'pin': pin,
      'share': share,
      'trash': trash
    });
  }

  ngOnInit() {
  }

}
