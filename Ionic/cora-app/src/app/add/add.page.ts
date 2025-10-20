import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonNav } from '@ionic/angular/standalone';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  standalone: true,
  imports: [IonNav, CommonModule, FormsModule]
})
export class AddPage implements OnInit {

  constructor() { }

  root = MenuComponent;

  ngOnInit() {
  }

}
