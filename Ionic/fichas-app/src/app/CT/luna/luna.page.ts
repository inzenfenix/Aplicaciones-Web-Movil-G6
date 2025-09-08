import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-luna',
  templateUrl: './luna.page.html',
  styleUrls: ['./luna.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LunaPage {
  // true = brillante, false = oscura
  lunaBrillante = true;

  toggleLuna() {
    this.lunaBrillante = !this.lunaBrillante;
  }
}
