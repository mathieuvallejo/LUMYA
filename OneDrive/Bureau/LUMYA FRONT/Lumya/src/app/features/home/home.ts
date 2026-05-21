import { Component, OnInit, signal, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/services/auth.service';
import { VideoService, Video } from '../../core/services/video.service';
import { LikeService } from '../../core/services/like.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  serverUrl = environment.serverUrl;
  user = signal<AuthResponse | null>(null);
  videos = signal<Video[]>([]);
  pausedStates = signal<Set<number>>(new Set());
  isMuted = signal<boolean>(true);
  likedVideos = signal<Set<number>>(new Set());

  @ViewChildren('videoRef') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;

  constructor(private authService: AuthService, private videoService: VideoService, private likeService: LikeService) {}

  ngOnInit(): void {
    this.user.set(this.authService.getCurrentUser());
    this.videoService.getVideos().subscribe({
      next: data => this.videos.set(data),
      error: err => console.error('VIDEO ERROR:', err)
    });
  }

  isPaused(index: number): boolean {
    return this.pausedStates().has(index);
  }

  togglePlay(index: number): void {
    const videoEl = this.videoElements.get(index)?.nativeElement;
    if (!videoEl) return;

    const states = new Set(this.pausedStates());
    if (videoEl.paused) {
      videoEl.play();
      states.delete(index);
    } else {
      videoEl.pause();
      states.add(index);
    }
    this.pausedStates.set(states);
  }

  toggleMute(): void {
    const newMuted = !this.isMuted();
    this.isMuted.set(newMuted);
    this.videoElements.forEach(el => {
      el.nativeElement.muted = newMuted;
    });
  }



  isLiked(videoId: number): boolean {
    return this.likedVideos().has(videoId);
  }


  scrollToNext(event: any): void {
    const currentWrapper = (event.target as HTMLElement).closest('.video-wrapper');
    const nextWrapper = currentWrapper?.nextElementSibling;
    if (nextWrapper) {
      nextWrapper.scrollIntoView({ behavior: 'smooth' });
    }
  }

  formatCount(n?: number): string {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  }

  getVideoUrl(urlVideo?: string): string {
    if (!urlVideo) return '';
    return this.serverUrl + '/' + urlVideo.replace(/^\/+/, '');
  }

  scrollToPrev(event: any): void {
    const currentWrapper = (event.target as HTMLElement).closest('.video-wrapper');
    const prevWrapper = currentWrapper?.previousElementSibling;
    if (prevWrapper) {
      prevWrapper.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
