import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAvatar, IonContent, IonHeader, IonTitle, IonToolbar,IonCol, IonGrid, IonRow,IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-klaus1',
  templateUrl: './klaus1.page.html',
  styleUrls: ['./klaus1.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonCol, IonGrid, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonAvatar ]
})
export class Klaus1Page implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
