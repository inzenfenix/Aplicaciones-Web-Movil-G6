import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonItemDivider } from '@ionic/angular/standalone';
import { LucideAngularModule, Heart } from 'lucide-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    [LucideAngularModule],
    IonItemDivider
],
})
export class HomePage implements OnInit {
  readonly heart = Heart;

  constructor() {}

  ngOnInit() {}
}
