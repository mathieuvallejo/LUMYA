import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Commentaire {
  idCommentaire?: number;
  contenuCommentaire: string;
  datePost?: Date | string;
  idVideo: number;
  idUser: number;
}

export interface CommentaireWithUser extends Commentaire {
  userPrenom?: string;
  userNom?: string;
  userPdp?: string;
}

@Injectable({ providedIn: 'root' })
export class CommentaireService {
  private apiUrl = `${environment.serverUrl}/api/commentaire`;

  constructor(private http: HttpClient) {}

  getByVideo(idVideo: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/video/${idVideo}`, { withCredentials: true });
  }

  create(data: { contenuCommentaire: string; idVideo: number; idUser: number }): Observable<Commentaire> {
    return this.http.post<Commentaire>(this.apiUrl, data, { withCredentials: true });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
