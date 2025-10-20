import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCardTitle,
  IonList,
  IonRow,
  IonGrid,
  IonCol,
  IonCardHeader,
  IonCard,
  IonSearchbar,
  IonCardContent,
  IonItem,
  IonAvatar,
  IonLabel,
  InfiniteScrollCustomEvent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-search-examenes',
  templateUrl: './search-examenes.component.html',
  styleUrls: ['./search-examenes.component.scss'],
  imports: [IonInfiniteScrollContent, IonInfiniteScroll, 
    IonLabel,
    IonAvatar,
    IonItem,
    IonCardContent,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCol,
    IonGrid,
    IonRow,
    IonList,
    IonCardTitle,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonContent,
  ],
})
export class SearchExamenesComponent implements OnInit {
  public data: { item: string; date: string; doctor: string }[] = [];
    public results = [...this.data];
  
    constructor() {}
  
    ngOnInit() {
      this.generateItems();
    }
  
    private generateItems() {
      const count = this.data.length + 1;
      for (let i = 0; i < 50; i++) {
        const item = `Examen ${count + i}`;
        const date = this.randomDate(
          new Date(2012, 0, 1),
          new Date()
        ).toLocaleDateString();
        const doctor = `Médico solicitante: Dr. ${count + i}`;
  
        this.data.push({
          item: item,
          date: date,
          doctor: doctor,
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
          d.doctor.toLowerCase().includes(query));
        } );
  
    }
  
    onIonInfinite(event: InfiniteScrollCustomEvent) {
      this.generateItems();
      setTimeout(() => {
        event.target.complete();
      }, 500);
    }
}
