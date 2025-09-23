import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRippleEffect
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.page.html',
  styleUrls: ['./home-page.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonRippleEffect,
  ],
})
export class HomePagePage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  goToRelevant() {
    this.router.navigate(['/relevant-information']);
  }

  goToCT() {
    this.router.navigate(['/ct']);
  }

  goToKK() {
    this.router.navigate(['/kk']);
  }
}
