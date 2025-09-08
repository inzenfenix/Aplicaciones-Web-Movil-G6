import { Component, OnInit } from '@angular/core';
import {
  IonInput,
  IonItem,
  IonList,
  IonInputPasswordToggle,
  IonInputOtp,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-input-stuff',
  templateUrl: './input-stuff.page.html',
  styleUrls: ['./input-stuff.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonItem,
    IonList,
    IonInputPasswordToggle,
    IonInputOtp,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
  ],
})
export class InputStuffPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
