import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TraiterService {
  private apiUrl = `${environment.serverUrl}/api/traiter`;

  constructor(private http: HttpClient) {}

  add(idTheme: number, idVideo: number): Observable<any> {
    return this.http.post(this.apiUrl, { idTheme, idVideo }, { withCredentials: true });
  }

  remove(idTheme: number, idVideo: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idTheme}/${idVideo}`, { withCredentials: true });
  }
}
