import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCol,
  IonGrid,
  IonRow,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-cards2-therebellion',
  templateUrl: './cards2-therebellion.page.html',
  styleUrls: ['./cards2-therebellion.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCol,
    IonGrid,
    IonRow,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
  ],
})
export class Cards2TherebellionPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
