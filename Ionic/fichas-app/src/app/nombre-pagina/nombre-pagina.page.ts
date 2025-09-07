import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-nombre-pagina',
  templateUrl: './nombre-pagina.page.html',
  styleUrls: ['./nombre-pagina.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonicModule] 
})
export class NombrePaginaPage implements OnInit {
  num1: number = 0;
  num2: number = 0;
  resultado: number | null = null;

  constructor(private router: Router) {}

  sumar() {
    this.resultado = Number(this.num1) + Number(this.num2);
  }
  irATab3() {
    this.router.navigate(['/tabs/tab3']);       

  }

  ngOnInit() {}
}
