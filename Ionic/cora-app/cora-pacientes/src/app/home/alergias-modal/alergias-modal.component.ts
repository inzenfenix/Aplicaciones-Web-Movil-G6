import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
import { AllergiesApi, Allergy } from '../../services/allergies/allergies-api';
@Component({
  selector: 'app-alergias-modal',
  templateUrl: './alergias-modal.component.html',
  styleUrls: ['./alergias-modal.component.scss'],
  imports: [
    HttpClientModule,
    IonInput,
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
    [LucideAngularModule],
  ],
})
export class AlergiasModalComponent implements OnInit {
  @ViewChild('accordionAlergiasGroup', { static: true })
  accordionGroup!: IonAccordionGroup;

  allergies: Allergy[] = [];

  constructor(
    private modalCtrl: ModalController,
    private allergiesService: AllergiesApi
  ) {}

  ngOnInit(): void {
    this.generateItems();
    this.allergiesService.allergies$.subscribe(data => {
    this.allergies = data;
  });
  }

  readonly chartPie = ChartPie;
  readonly add = Plus;

  items: string[] = [];

  private generateItems() {
    const count = this.items.length + 1;
    for (let i = 0; i < 5; i++) {
      this.items.push(`${count + i}`);
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

  handleInputNewAllergy(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const value = target.value ? target.value : '';
    if (value == '') return;

    this.addAlergy(value);
  }

  addAlergy(name: string) {
    this.allergiesService.addAllergy(name).subscribe();
  }

  update(allergy: Allergy, newName: string) {
    this.allergiesService.updateAllergy(allergy.id, newName).subscribe();
  }

  delete(allergy: Allergy) {
    this.allergiesService.deleteAllergy(allergy.id).subscribe();
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
