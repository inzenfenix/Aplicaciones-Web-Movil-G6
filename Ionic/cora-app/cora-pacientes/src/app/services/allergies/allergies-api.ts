// src/app/services/allergies.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  interval,
  switchMap,
  startWith,
  BehaviorSubject,
} from 'rxjs';

export interface Allergy {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AllergiesApi {
  private apiUrl =
    'https://1s0go95e7b.execute-api.us-east-2.amazonaws.com/allergies';
  private _allergies$ = new BehaviorSubject<Allergy[]>([]);

  constructor(private http: HttpClient) {
    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.getAllergiesFromApi())
      )
      .subscribe({
        next: (allergies) => this._allergies$.next(allergies),
        error: (err) => console.error('Error fetching allergies', err),
      });
  }

  get allergies$(): Observable<Allergy[]> {
    return this._allergies$.asObservable();
  }

  private getAllergiesFromApi(): Observable<Allergy[]> {
    return this.http.get<Allergy[]>(this.apiUrl);
  }

  addAllergy(name: string) {
    return this.http.post<Allergy>(this.apiUrl, { name });
  }

  updateAllergy(id: string, name: string) {
    return this.http.put<Allergy>(`${this.apiUrl}/${id}`, { name });
  }

  deleteAllergy(id: string) {
    return this.http.delete<{ deleted: string }>(`${this.apiUrl}/${id}`);
  }
}
