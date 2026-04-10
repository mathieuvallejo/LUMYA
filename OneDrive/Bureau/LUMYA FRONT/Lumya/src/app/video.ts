import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export interface url {
  idVideo?: number;
  titre: string;
  urlVideo?: string;
  datePublication?: Date;
  nbVues?: number;
  statutModeration?: number;
  
}



export class Video {
private apiUrl = environment.apiUrl;



constructor(private http: HttpClient) {}
 
// getvideoById(id:number):Observable<>
// }
