import { Component } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonGrid, IonCol, IonRow, IonCardContent, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { NgFor } from '@angular/common'; // ✅ Importa NgFor

@Component({
  selector: 'app-facts',
  templateUrl: './facts.page.html',
  styleUrls: ['./facts.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonRow,
    IonCol,
    IonToolbar,
    IonTitle,
    IonGrid,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    NgFor // ✅ importante para *ngFor
  ],
})
export class FactsPage {
  facts: string[] = [
    'Los gatos duermen entre 12 y 16 horas al día.',
    'Los gatos tienen 32 músculos en cada oreja.',
    'El ronroneo de los gatos puede ayudar a reducir el estrés.',
    'Los gatos pueden hacer más de 100 sonidos diferentes.',
    'Los gatos domésticos pueden correr hasta 48 km/h.',
  ];
}
