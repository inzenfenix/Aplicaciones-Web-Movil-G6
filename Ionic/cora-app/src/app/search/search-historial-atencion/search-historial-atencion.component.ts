import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonTitle,
  InfiniteScrollCustomEvent,
  IonToolbar,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCol,
  IonCard,
  IonInfiniteScrollContent,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonSearchbar,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonInfiniteScroll,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-search-historial-atencion',
  templateUrl: './search-historial-atencion.component.html',
  styleUrls: ['./search-historial-atencion.component.scss'],
  imports: [
    IonInfiniteScroll,
    IonLabel,
    IonAvatar,
    IonItem,
    IonList,
    IonSearchbar,
    IonRow,
    IonGrid,
    IonCardContent,
    IonInfiniteScrollContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonCol,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonContent,
  ],
})
export class SearchHistorialAtencionComponent implements OnInit {
  public data: { item: string; date: string; reason: string }[] = [];
  public results = [...this.data];

  constructor() {}

  ngOnInit() {
    this.generateItems();
  }

  private generateItems() {
    const count = this.data.length + 1;
    for (let i = 0; i < 50; i++) {
      const item = `Hospital ${count + i}`;
      const date = this.randomDate(
        new Date(2012, 0, 1),
        new Date()
      ).toLocaleDateString();
      const reason = `Razón: ${count + i}`;

      this.data.push({
        item: item,
        date: date,
        reason: reason,
      });
    }

    this.results = [...this.data];
  }

  randomDate(start: Date, end: Date) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    this.results = this.data.filter((d) =>
      {
        return (d.item.toLowerCase().includes(query) ||
        d.date.toLowerCase().includes(query) ||
        d.reason.toLowerCase().includes(query));
      } );

  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }
}
