import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Humeur {
  idHumeur?: number;
  humeurs: string;
  idUser: number;
}

@Injectable({
  providedIn: 'root',
})
export class HumeurService {
  private apiUrl = `${environment.serverUrl }/api/humeur`;

  constructor(private http: HttpClient) {}

  create(humeurs: string, idUser: number): Observable<Humeur> {
    return this.http.post<Humeur>(this.apiUrl, { humeurs, idUser }, { withCredentials: true });
  }

  getByUser(idUser: number): Observable<Humeur[]> {
    return this.http.get<Humeur[]>(`${this.apiUrl}/user/${idUser}`, { withCredentials: true });
  }
}
