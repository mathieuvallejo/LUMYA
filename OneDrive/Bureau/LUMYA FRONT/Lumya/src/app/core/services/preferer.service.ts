import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Preference {
  idTheme: number;
  libelle?: string;
}

@Injectable({ providedIn: 'root' })
export class PrefererService {
  private apiUrl = `${environment.serverUrl}/api/preferer`;

  constructor(private http: HttpClient) {}

  getByUser(idUser: number): Observable<Preference[]> {
    return this.http.get<Preference[]>(`${this.apiUrl}/user/${idUser}`, { withCredentials: true });
  }

  add(idUser: number, idTheme: number): Observable<Preference> {
    return this.http.post<Preference>(this.apiUrl, { idUser, idTheme }, { withCredentials: true });
  }

  remove(idUser: number, idTheme: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idUser}/${idTheme}`, { withCredentials: true });
  }
}
