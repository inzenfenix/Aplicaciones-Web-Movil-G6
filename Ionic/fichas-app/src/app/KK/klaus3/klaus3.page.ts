import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-klaus3',
  templateUrl: './klaus3.page.html',
  styleUrls: ['./klaus3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Klaus3Page implements OnInit {
  presentingElement!: HTMLElement | null;


  constructor() { }

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
  }

}
