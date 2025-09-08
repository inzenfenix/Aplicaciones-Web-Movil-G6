import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
interface Food {
  id: number;
  name: string;
  type: string;
}

@Component({
  selector: 'app-klaus4',
  templateUrl: './klaus4.page.html',
  styleUrls: ['./klaus4.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Klaus4Page implements OnInit {
  foods: Food[] = [
    {
      id: 1,
      name: 'Manzana',
      type: 'fruta',
    },
    {
      id: 2,
      name: 'Zanahoria',
      type: 'verdura',
    },
    {
      id: 3,
      name: 'Cupcakes',
      type: 'postre',
    },
  ];

  compareWith(o1: Food, o2: Food): boolean {
    return o1.id === o2.id;
  }

  handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    console.log('Current value:', JSON.stringify(target.value));
  }

  constructor() { }

  ngOnInit() {
  }

}
