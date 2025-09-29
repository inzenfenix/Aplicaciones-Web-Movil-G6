import { Component, OnInit } from '@angular/core';
import { IonSelect, IonTitle, IonHeader, IonToolbar, IonBackButton, IonButtons, IonContent, IonGrid, IonCol, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonCardSubtitle, IonSelectOption, IonText, IonTextarea, IonButton, IonItem, IonDatetime, IonDatetimeButton, IonModal } from '@ionic/angular/standalone';

@Component({
  selector: 'app-examen-medico',
  templateUrl: './examen-medico.component.html',
  styleUrls: ['./examen-medico.component.scss'],
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
    IonCardSubtitle,
    IonSelectOption,
    IonSelect, IonText, IonButton],
})
export class ExamenMedicoComponent implements OnInit {
  public examTypes: string[] = [
    'Endoscopía',
    'Hemograma',
    'Perfil Lipídico',
    'Radiografía de tórax',
    'Exámen de orina',
    'Electrocardiograma',
    'Examen general'
  ];

  customInterfaceOptions = {
    header: 'Tipos de exámenes',
    breakpoints: [0, 0.5],
    initialBreakpoint: 0.5,
  };

  public receta:{ nombre: string, cantidad:number}[] = [{nombre:"", cantidad:0}];
  todayTime:String = this.getCurrentTimeLocale();

  public results = [...this.examTypes];
  constructor() {}

  ngOnInit() {}

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    this.results = this.examTypes.filter((d) => {
      return d.toLowerCase().includes(query);
    });
  }

  addMeds()
  {
    this.receta.push({nombre:"", cantidad:0});
  }

  substractMeds()
  {
    this.receta.pop();
  }  

  
  
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
