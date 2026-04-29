import { Component, OnInit, signal } from '@angular/core';
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
  user = signal<AuthResponse | null>(null);
  videos = signal<Video[]>([]);

  constructor(private authService: AuthService, private videoService: VideoService) {}

  ngOnInit(): void {
    this.user.set(this.authService.getCurrentUser());
    this.videoService.getVideos().subscribe({
      next: data => this.videos.set(data),
      error: err => console.error('VIDEO ERROR:', err)
    });
  }

  scrollToNext(event: any) {
  const currentWrapper = event.target.closest('.video-wrapper');
  const nextWrapper = currentWrapper.nextElementSibling;
  if (nextWrapper) {
    nextWrapper.scrollIntoView({ behavior: 'smooth' });
  }


  
}


  showVideo(video: Video) {
    console.log('Video clicked:', video.titre); 
}
}

