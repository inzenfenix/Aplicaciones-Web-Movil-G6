// src/app/services/allergies.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import {
  Observable,
  interval,
  switchMap,
  startWith,
  BehaviorSubject,
  catchError,
  of,
  tap,
} from 'rxjs';

export interface Allergy {
  userId: string;
  idAlergia: string;      // the primary key from your table
  alergeno: string;
  tipoAlergeno: string;
}

@Injectable({
  providedIn: 'root'
})
export class AllergiesApi {

  private apiUrl = environment.API_URL;

  private _allergies$ = new BehaviorSubject<Allergy[]>([]);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);

  public currentUserId: string | null = null;

  constructor(private http: HttpClient) {}

  // ----------- Public Observables -----------
  get allergies$(): Observable<Allergy[]> {
    return this._allergies$.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  get error$(): Observable<string | null> {
    return this._error$.asObservable();
  }

  // ----------- Init Polling for a specific user -----------
  startPolling(userId: string) {
    this.currentUserId = userId;

    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.getAllergies())
      )
      .subscribe({
        next: allergies => {
          this._allergies$.next(allergies);
          this._error$.next(null);
        },
        error: err => {
          console.error('Polling error:', err);
          this._error$.next(this.getErrorMessage(err));
        }
      });
  }

  // ----------- GET (requires userId) -----------
  getAllergies(): Observable<Allergy[]> {
    this._loading$.next(true);

    return this.http.get<Allergy[]>(`${this.apiUrl}/allergies/${this.currentUserId}`).pipe(
      tap(() => this._loading$.next(false)),
      catchError((error: HttpErrorResponse) => {
        this._loading$.next(false);
        console.error('API Error:', error);
        return of([]);
      })
    );
  }

  // ----------- POST -----------
  addAllergy(allergy: Omit<Allergy, 'idAlergia'>): Observable<any> {
    this._loading$.next(true);

    return this.http.post<Allergy>(`${this.apiUrl}/allergies`, allergy).pipe(
      tap(() => {
        if (this.currentUserId) {
          this.getAllergies().subscribe(allergies => {
            this._allergies$.next(allergies);
          });
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this._loading$.next(false);
        console.error('Error adding allergy:', error);
        throw error;
      })
    );
  }

  // ----------- PUT (update by idAlergia) -----------
  updateAllergy(idAlergia: string, update: Partial<Allergy>): Observable<any> {
    return this.http.put<Allergy>(`${this.apiUrl}/allergies/${this.currentUserId}/allergy/${idAlergia}`, update).pipe(
      tap(() => {
        const current = this._allergies$.value;
        const updated = current.map(a =>
          a.idAlergia === idAlergia ? { ...a, ...update } : a
        );
        this._allergies$.next(updated);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error updating allergy:', error);
        throw error;
      })
    );
  }

  // ----------- DELETE -----------
  deleteAllergy(idAlergia: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/allergies/${this.currentUserId}/allergy/${idAlergia}`).pipe(
      tap(() => {
        const current = this._allergies$.value;
        const filtered = current.filter(a => a.idAlergia !== idAlergia);
        this._allergies$.next(filtered);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error deleting allergy:', error);
        throw error;
      })
    );
  }

  // Manual refresh method
  refreshAllergies(): void {
    this.getAllergies().subscribe(allergies => {
      this._allergies$.next(allergies);
    });
  }

  // ----------- Helper -----------
  private getErrorMessage(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (err.status === 0) return 'Cannot reach server';
    return 'Unexpected error';
  }
}
