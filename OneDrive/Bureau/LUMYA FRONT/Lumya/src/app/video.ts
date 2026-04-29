import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

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
export class VideoService {
  private apiUrl = `${environment.apiUrl}/video`;

  constructor(private http: HttpClient) {}

  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(this.apiUrl);
  }
}