import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonItem,
  IonLabel,
  IonDatetime, 
  IonDatetimeButton,
  IonModal
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-accordion-page',
  templateUrl: 'accordions.page.html',
  styleUrls: ['accordions.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonItem,
    IonLabel,
    IonDatetime, 
    IonDatetimeButton,
    IonModal
  ],
})
export class AccordionsPage {
  @ViewChild('accordionGroup', { static: true })
  accordionGroup!: IonAccordionGroup;

  todayTime:String = this.getCurrentTimeLocale();
  

  toggleAccordion = () => {
    const nativeEl = this.accordionGroup;
    if (nativeEl.value === 'second') {
      nativeEl.value = undefined;
    } else {
      nativeEl.value = 'second';
    }
  };
  
  constructor() 
  {}

  getCurrentTimeLocale():String
  {
    let curTime = new Date().toLocaleTimeString().split(" ")[0];
    if(curTime.length == 8)
    {
      return curTime;
    }

    else
    {
      return "0".concat(curTime);
    }
  }
}
