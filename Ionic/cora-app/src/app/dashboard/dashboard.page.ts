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
  IonIcon, IonToggle } from '@ionic/angular/standalone';

import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonToggle, 
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

  // Shared chart options
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#ffffff' }
      },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          font: { size: 12, family: 'Arial' },
          color: '#ffffff'
        },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#ffffff', font: { size: 12 } },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    },
    layout: { padding: { top: 10, right: 10, bottom: 20, left: 10 } }
  };

  // Weight data
  pesoData: ChartData<'line'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      {
        label: 'Peso (kg)',
        data: [85, 86, 87, 92, 90],
        borderColor: '#4fd1c5',
        backgroundColor: '#4fd1c5',
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3
      }
    ]
  };

  // Blood pressure data
  presionData: ChartData<'line'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      {
        label: 'Presión (mmHg)',
        data: [120, 118, 121, 125, 119],
        borderColor: '#ff6b6b',
        backgroundColor: '#ff6b6b',
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3
      }
    ]
  };

  // Heartbeat frequency data
  frecuenciaData: ChartData<'line'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      {
        label: 'Frecuencia Cardíaca (bpm)',
        data: [70, 72, 75, 78, 74],
        borderColor: '#f9c74f',
        backgroundColor: '#f9c74f',
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3
      }
    ]
  };

  constructor() {}

  ngOnInit() {}

  // Toggle dark mode + adjust chart colors
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);

    const textColor = this.darkMode ? '#ffffff' : '#000000';
    const gridColor = this.darkMode ? 'rgba(255,255,255,0.1)' : '#e0e0e0';

    this.chartOptions = {
      ...this.chartOptions,
      plugins: {
        ...this.chartOptions.plugins,
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: {
          ...this.chartOptions.scales?.['x'],
          ticks: { ...this.chartOptions.scales?.['x']?.ticks, color: textColor },
          grid: { color: gridColor }
        },
        y: {
          ...this.chartOptions.scales?.['y'],
          ticks: { ...this.chartOptions.scales?.['y']?.ticks, color: textColor },
          grid: { color: gridColor }
        }
      }
    };
  }
}
