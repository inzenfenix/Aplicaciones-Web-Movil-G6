// src/app/services/ficha-medica.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DynamoDBService } from './dynamodb.service';
import { FichaMedica, Alergia } from '../models/ficha-medica.model';

@Injectable({
  providedIn: 'root'
})
export class FichaMedicaService {
  private fichaSubject = new BehaviorSubject<FichaMedica | null>(null);
  public ficha$ = this.fichaSubject.asObservable();

  constructor(private db: DynamoDBService) {}

  async cargarFicha(pacienteId: string) {
    try {
      const ficha = await this.db.getFichaMedica(pacienteId);
      this.fichaSubject.next(ficha);
    } catch (error) {
      console.error('Error cargando ficha:', error);
    }
  }

  async agregarAlergia(pacienteId: string, alergiaData: any) {
    try {
      const nuevaAlergia = await this.db.addAlergia(pacienteId, alergiaData);
      const fichaActual = this.fichaSubject.value;
      
      if (fichaActual) {
        const fichaActualizada = {
          ...fichaActual,
          alergias: [...fichaActual.alergias, nuevaAlergia]
        };
        this.fichaSubject.next(fichaActualizada);
      }
      
      return nuevaAlergia;
    } catch (error) {
      console.error('Error agregando alergia:', error);
      throw error;
    }
  }

  async eliminarAlergia(pacienteId: string, alergiaId: string) {
    try {
      await this.db.deleteAlergia(pacienteId, alergiaId);
      const fichaActual = this.fichaSubject.value;
      
      if (fichaActual) {
        const alergiasActualizadas = fichaActual.alergias.map(alergia =>
          alergia.alergia_id === alergiaId 
            ? { ...alergia, is_active: false }
            : alergia
        );
        
        const fichaActualizada = {
          ...fichaActual,
          alergias: alergiasActualizadas
        };
        this.fichaSubject.next(fichaActualizada);
      }
    } catch (error) {
      console.error('Error eliminando alergia:', error);
      throw error;
    }
  }

  getAlergiasActivas(): Alergia[] {
    const ficha = this.fichaSubject.value;
    return ficha ? ficha.alergias.filter(a => a.is_active) : [];
  }
}