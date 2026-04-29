import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../services/auth.service';
import { VideoService, Video } from '../video';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  user: AuthResponse | null = null;
  videos: Video[] = [];

  constructor(private authService: AuthService, private videoService: VideoService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.videoService.getVideos().subscribe(data => {
      this.videos = data;
    });
  }
}
