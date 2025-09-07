import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonActionSheet,
  IonButton,
} from '@ionic/angular/standalone';

import type { OverlayEventDetail } from '@ionic/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actions-and-sheets',
  templateUrl: './actions-and-sheets.page.html',
  styleUrls: ['./actions-and-sheets.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonActionSheet,
    IonButton,
  ],
})

export class ActionsAndSheetsPage implements OnInit {

  public actionSheetButtons = [
    {
      text: 'Borrar',
      role: 'destructive',
      data: {
        action: 'delete',
      },
    },
    {
      text: 'Ir a otra página',
      data: {
        action: 'move',
      },
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  constructor(private router: Router) {}

  Actions(event: CustomEvent<OverlayEventDetail>) {
    const eventData  = event.detail;

    if(eventData.data.action == "move")
    {
      this.router.navigate(['/tomys/input-stuff']);   
    }
  }
  

  ngOnInit() {}
}
