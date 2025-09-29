import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonNav } from "@ionic/angular/standalone";
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonNav, CommonModule, FormsModule]
})
export class SearchPage implements OnInit {
  root = MenuComponent;
  
  constructor() { }

  ngOnInit() {
  }

}
