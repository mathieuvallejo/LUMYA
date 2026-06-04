import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  idUser?: number;
  prenom?: string;
  nom?: string;
  email?: string;
  pdp?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.serverUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
