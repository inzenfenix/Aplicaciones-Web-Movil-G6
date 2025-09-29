import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  InfiniteScrollCustomEvent,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonFooter,
  IonItemDivider,
  IonList,
  IonItem,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonAccordionGroup,
  IonAccordion,
  IonInput,
   ModalController,
} from '@ionic/angular/standalone';
import { ChartPie, LucideAngularModule, Plus } from 'lucide-angular';
@Component({
  selector: 'app-habitos-modal',
  templateUrl: './habitos-modal.component.html',
  styleUrls: ['./habitos-modal.component.scss'],
  imports:[IonInput,
      IonAccordion,
      IonAccordionGroup,
      IonInfiniteScrollContent,
      IonInfiniteScroll,
      IonLabel,
      IonItem,
      IonList,
      IonItemDivider,
      IonFooter,
      IonSearchbar,
      FormsModule,
      IonToolbar,
      IonHeader,
      IonTitle,
      IonButtons,
      IonButton,
      IonContent,
      [LucideAngularModule],],
})
export class HabitosModalComponent  implements OnInit {

  @ViewChild('accordionAlergiasGroup', { static: true })
  accordionGroup!: IonAccordionGroup;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.generateItems();
  }

  readonly chartPie = ChartPie;
  readonly add = Plus;

  items: string[] = [];

  private generateItems() {
    const count = this.items.length + 1;
    for (let i = 0; i < 5; i++) {
      this.items.push(`Habito: ${count + i}`);
    }
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  toggleInputAccordion = () => {
    const nativeEl = this.accordionGroup;
    if (nativeEl.value === 'anadir-data') {
      nativeEl.value = undefined;
    } else {
      nativeEl.value = 'anadir-data';
    }
  };

  handleInputNewAllergy(event: Event)
  {
    const target = event.target as HTMLIonSearchbarElement;
    const value = target.value ? target.value : '';
    if(value == '') return;

    
  }

  addAllergy()
  {

  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

}
