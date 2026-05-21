import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Video {
  idVideo?: number;
  titre: string;
  urlVideo?: string;
  datePublication?: Date;
  nbVues?: number;
  statutModeration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  private apiUrl = `${environment.serverUrl }/api/like`;

  constructor(private http: HttpClient) {}

  likeVideo(userId: number, videoId: number): Observable<Video[]> {
    return this.http.post<Video[]>(`${this.apiUrl}`, { userId, videoId }, { withCredentials: true });
  }

}
