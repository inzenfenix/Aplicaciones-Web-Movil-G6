import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonDatetime } from '@ionic/angular/standalone';

@Component({
  selector: 'app-klaus6',
  templateUrl: './klaus6.page.html',
  styleUrls: ['./klaus6.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonDatetime]
})
export class Klaus6Page implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
