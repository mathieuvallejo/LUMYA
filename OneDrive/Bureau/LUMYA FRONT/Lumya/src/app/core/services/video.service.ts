import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Video {
  idVideo?: number;
  idUser?: number;
  titre: string;
  urlVideo?: string;
  datePublication?: Date;
  nbVues?: number;
  statutModeration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private apiUrl = `${environment.serverUrl}/api/video`;

  constructor(private http: HttpClient) {}

  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(this.apiUrl, { withCredentials: true });
  }

  getVideoById(id: number): Observable<Video> {
    return this.http.get<Video>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getVideosByUser(idUser: number): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/user/${idUser}`, { withCredentials: true });
  }

  uploadVideo(titre: string, file: File, idUser: number): Observable<HttpEvent<Video>> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('idUser', String(idUser));
    formData.append('video', file);
    const req = new HttpRequest('POST', this.apiUrl, formData, {
      withCredentials: true,
      reportProgress: true,
    });
    return this.http.request<Video>(req);
  }

  editVideo(id: number, data: Partial<Video>): Observable<Video> {
    return this.http.put<Video>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  deleteVideo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  addView(id: number): Observable<Video> {
    return this.http.patch<Video>(`${this.apiUrl}/${id}/views`, {}, { withCredentials: true });
  }
}
