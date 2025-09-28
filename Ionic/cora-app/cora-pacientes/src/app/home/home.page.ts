import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRow,
  IonCard,
  IonCol,
  IonGrid,
  IonCardTitle,
  IonImg,
  IonAvatar,
  IonCardSubtitle,
  IonCardHeader,
  IonCardContent,
  IonChip,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail, IonAccordion, IonAccordionGroup } from '@ionic/angular/standalone';
import {
  LucideAngularModule,
  ClipboardList,
  ChartPie,
  CircleGauge,
} from 'lucide-angular';
import { RoutableButtonComponent } from '../routable-button/routable-button.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonAccordionGroup, IonAccordion, 
    IonLabel,
    IonItem,
    IonList,
    IonChip,
    IonCardTitle,
    IonGrid,
    IonCol,
    IonCard,
    IonRow,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonImg,
    IonAvatar,
    [LucideAngularModule],
    IonCardSubtitle,
    IonCardHeader,
    RoutableButtonComponent,
    IonCardContent,
    IonThumbnail,
    IonText,
  ],
})
export class HomePage implements OnInit {
  readonly clipboardList = ClipboardList;
  readonly chartPie = ChartPie;
  readonly circleGauge = CircleGauge;

  constructor() {}

  ngOnInit() {}
}
