import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Theme {
  idTheme: number;
  libelle: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private apiUrl = `${environment.serverUrl}/api/themes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Theme[]> {
    return this.http.get<Theme[]>(this.apiUrl, { withCredentials: true });
  }
}
