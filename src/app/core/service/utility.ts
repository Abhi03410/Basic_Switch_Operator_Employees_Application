import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Utility {
  private http: HttpClient = inject(HttpClient);

  private readonly API_MAIN_URL = environment.apiUrl;

  //Get Method:-
  get<T = any>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.API_MAIN_URL}/${endpoint}`, { params });
  }

  //Post Method:-
  post<T = any>(endpoint: string, data?: any): Observable<T> {
    return this.http.post<T>(`${this.API_MAIN_URL}/${endpoint}`, data);
  }

  //Delete Method:-
  delete<T = any>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.API_MAIN_URL}/${endpoint}`);
  }

  //Put Method:-
  //`${this.API_MAIN_URL}/${endpoint}` =  http://localhost:3000/employees/1
  put<T = any>(endpoint: string, data?: any): Observable<T> {
    return this.http.put<T>(`${this.API_MAIN_URL}/${endpoint}`, data);
  }

  //Patch Method:-
  patch<T = any>(endpoint: string, data?: any): Observable<T> {
    return this.http.patch<T>(`${this.API_MAIN_URL}/${endpoint}`, data);
  }

}
