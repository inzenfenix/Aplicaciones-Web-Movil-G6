import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonRippleEffect  } from '@ionic/angular/standalone';

@Component({
  selector: 'app-water-buttons',
  templateUrl: './water-buttons.page.html',
  styleUrls: ['./water-buttons.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRippleEffect ]
})
export class WaterButtonsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
