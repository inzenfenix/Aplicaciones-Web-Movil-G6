import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon
  ]
})
export class DashboardPage implements OnInit {

  darkMode = false;

  // Configuración común para todos los gráficos
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#000' } // color de los labels en light mode
      },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,  // no omitir ningún label
          maxRotation: 45,
          minRotation: 0,
          font: { size: 12, family: 'Arial' },
          color: '#000'
        },
        grid: {
          drawTicks: true,
          color: '#e0e0e0'
        }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#000', font: { size: 12 } },
        grid: { color: '#e0e0e0' }
      }
    },
    layout: {
      padding: { top: 10, right: 10, bottom: 20, left: 10 }
    }
  };

  // Datos de gráficos
  pesoData: ChartData<'line'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      {
        label: 'Peso (kg)',
        data: [85, 86, 87, 92, 90],
        borderColor: '#3880ff',
        backgroundColor: '#3880ff',
        fill: false,
        type: 'line',
        pointStyle: 'circle',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3
      }
    ]
  };

  presionData: ChartData<'line'> = {
    labels: ['01/03', '05/05', '10/05', '15/06', '20/08', '01/09', '23/09', '17/10', '15/11', '20/12'],
    datasets: [
      {
        label: 'Presión Arterial',
        data: [120, 132, 133, 145, 124, 121, 113, 156, 142, 118],
        borderColor: '#10dc60',
        backgroundColor: '#10dc60',
        fill: false,
        type: 'line',
        pointStyle: 'circle',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3
      }
    ]
  };

  glucosaData: ChartData<'line'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      {
        label: 'Glucosa (mg/dL)',
        data: [98, 123, 117, 103, 100],
        borderColor: '#ffce00',
        backgroundColor: '#ffce00',
        fill: false,
        type: 'line',
        pointStyle: 'circle',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3
      }
    ]
  };

  constructor() { }

  ngOnInit() { }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);
  }
}
