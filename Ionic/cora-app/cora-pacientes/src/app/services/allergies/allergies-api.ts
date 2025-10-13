// src/app/services/allergies.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  id: string;
  allergen: string;
  typeAllergen: string;
}

@Injectable({
  providedIn: 'root',
})
export class AllergiesApi {
  private apiUrl = 'https://9kbrqqu3il.execute-api.us-east-2.amazonaws.com/dev/allergies';
  private _allergies$ = new BehaviorSubject<Allergy[]>([]);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  get allergies$(): Observable<Allergy[]> {
    return this._allergies$.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  get error$(): Observable<string | null> {
    return this._error$.asObservable();
  }

  private startPolling(): void {
    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.getAllergiesFromApi())
      )
      .subscribe({
        next: (allergies) => {
          this._allergies$.next(allergies);
          this._error$.next(null);
        },
        error: (err) => {
          console.error('Error fetching allergies', err);
          this._error$.next(this.getErrorMessage(err));
        }
      });
  }

  private getAllergiesFromApi(): Observable<Allergy[]> {
    this._loading$.next(true);
    return this.http.get<Allergy[]>(this.apiUrl).pipe(
      tap(() => this._loading$.next(false)),
      catchError((error: HttpErrorResponse) => {
        this._loading$.next(false);
        console.error('API Error:', error);
        return of([]); // Return empty array on error to keep stream alive
      })
    );
  }

  addAllergy(name: string): Observable<any> {
    this._loading$.next(true);
    return this.http.post<Allergy>(this.apiUrl, { name }).pipe(
      tap(() => {
        // Trigger immediate refresh after adding
        this.getAllergiesFromApi().subscribe(allergies => {
          this._allergies$.next(allergies);
        });
      }),
      catchError((error: HttpErrorResponse) => {
        this._loading$.next(false);
        console.error('Error adding allergy:', error);
        throw error;
      })
    );
  }

  updateAllergy(id: string, name: string): Observable<any> {
    return this.http.put<Allergy>(`${this.apiUrl}/${id}`, { name }).pipe(
      tap(() => {
        // Update local state immediately
        const currentAllergies = this._allergies$.value;
        const updatedAllergies = currentAllergies.map(allergy => 
          allergy.id === id ? { ...allergy, name } : allergy
        );
        this._allergies$.next(updatedAllergies);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error updating allergy:', error);
        throw error;
      })
    );
  }

  deleteAllergy(id: string): Observable<any> {
    return this.http.delete<{ deleted: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Update local state immediately
        const currentAllergies = this._allergies$.value;
        const filteredAllergies = currentAllergies.filter(allergy => allergy.id !== id);
        this._allergies$.next(filteredAllergies);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error deleting allergy:', error);
        throw error;
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      return `Server error: ${error.status} - ${error.message}`;
    }
  }

  // Manual refresh method
  refreshAllergies(): void {
    this.getAllergiesFromApi().subscribe(allergies => {
      this._allergies$.next(allergies);
    });
  }
}