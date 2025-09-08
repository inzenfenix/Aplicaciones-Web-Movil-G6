import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ✅ necesario para ngClass

interface Tarea {
  nombre: string;
  completada: boolean;
}

@Component({
  selector: 'app-to-do-list',
  templateUrl: './to-do-list.page.html',
  styleUrls: ['./to-do-list.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], // ✅ aquí se importa
})
export class ToDoListPage {
  nuevaTarea = '';
  tareas: Tarea[] = [];

  agregarTarea() {
    if (!this.nuevaTarea.trim()) return;
    this.tareas.push({ nombre: this.nuevaTarea, completada: false });
    this.nuevaTarea = '';
  }

  eliminarTarea(index: number) {
    this.tareas.splice(index, 1);
  }
}
