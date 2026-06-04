import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Like {
  idLike?: number;
  idUser: number;
  idVideo?: number | null;
  idCommentaire?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  private apiUrl = `${environment.serverUrl}/api/likes`;

  constructor(private http: HttpClient) {}

  getLikesByUser(idUser: number): Observable<Like[]> {
    return this.http.get<Like[]>(`${this.apiUrl}/user/${idUser}`, { withCredentials: true });
  }

  likeVideo(idUser: number, idVideo: number): Observable<Like> {
    return this.http.post<Like>(`${this.apiUrl}`, { idUser, idVideo }, { withCredentials: true });
  }

  unlikeVideo(idUser: number, idVideo: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/video`, {
      body: { idUser, idVideo },
      withCredentials: true,
    });
  }

  likeCommentaire(idUser: number, idCommentaire: number): Observable<Like> {
    return this.http.post<Like>(`${this.apiUrl}`, { idUser, idCommentaire }, { withCredentials: true });
  }

  unlikeCommentaire(idUser: number, idCommentaire: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/commentaire`, {
      body: { idUser, idCommentaire },
      withCredentials: true,
    });
  }
}
