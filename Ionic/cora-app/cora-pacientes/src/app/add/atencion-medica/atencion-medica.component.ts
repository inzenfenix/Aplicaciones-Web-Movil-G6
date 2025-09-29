import { Component, OnInit } from '@angular/core';
import { IonSelect, IonTitle, IonHeader, IonToolbar, IonBackButton, IonButtons, IonContent, IonGrid, IonCol, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonCardSubtitle, IonSelectOption, IonText, IonTextarea, IonButton, IonItem, IonDatetime, IonDatetimeButton, IonModal } from '@ionic/angular/standalone';

@Component({
  selector: 'app-atencion-medica',
  templateUrl: './atencion-medica.component.html',
  styleUrls: ['./atencion-medica.component.scss'],
  imports: [IonModal, IonDatetimeButton, IonDatetime, IonItem, IonTextarea,
    IonInput,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonRow,
    IonCol,
    IonGrid,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonContent,
    IonCardSubtitle, IonButton],
})
export class AtencionMedicaComponent implements OnInit {

  customInterfaceOptions = {
    header: 'Tipos de exámenes',
    breakpoints: [0, 0.5],
    initialBreakpoint: 0.5,
  };

  public receta:{ nombre: string, cantidad:number}[] = [{nombre:"", cantidad:0}];
  todayTime:String = this.getCurrentTimeLocale();

  constructor() {}

  ngOnInit() {}  
  
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
