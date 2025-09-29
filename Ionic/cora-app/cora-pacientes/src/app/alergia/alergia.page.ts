import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FichaMedicaService } from '../services/ficha-medica.service';
import { Alergia } from '../models/ficha-medica.model';

@Component({
  selector: 'app-alergia',
  templateUrl: './alergia.page.html',
  styleUrls: ['./alergia.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AlergiaPage implements OnInit {
  alergias: Alergia[] = [];

  constructor(private fichaMedicaService: FichaMedicaService) { }

  async ngOnInit() {
    // Reemplaza 'pacienteId' por el id real del paciente
    await this.fichaMedicaService.cargarFicha('pacienteId');
    this.alergias = this.fichaMedicaService.getAlergiasActivas();
  }
}