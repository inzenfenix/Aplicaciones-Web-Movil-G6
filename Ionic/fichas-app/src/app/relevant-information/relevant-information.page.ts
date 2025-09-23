import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-relevant-information',
  templateUrl: './relevant-information.page.html',
  styleUrls: ['./relevant-information.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RelevantInformationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
