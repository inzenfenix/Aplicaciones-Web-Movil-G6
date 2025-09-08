import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-klaus2',
  templateUrl: './klaus2.page.html',
  styleUrls: ['./klaus2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Klaus2Page implements OnInit {
  public alertButtons= ['OK'];
  public alertInputs= [
    {
      placeholder: 'Nombre',
      required: true
    },
    {
      placeholder: 'Apellido',
      required: true
    },
    {
      type: 'number',
      placeholder: 'Edad',
      min: 1,
      max: 100,
      required: true
    },
    {
      placeholder: 'Email',
      type: 'email',
      required: true
    }

  ]

  constructor() { }

  ngOnInit() {
  }

}
