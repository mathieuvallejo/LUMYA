import { Component, OnInit, AfterViewInit, OnDestroy, signal, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/services/auth.service';
import { VideoService, Video } from '../../core/services/video.service';
import { LikeService } from '../../core/services/like.service';
import { environment } from '../../../environments/environment';
import { CommentPanel } from '../../shared/components/comment-panel/comment-panel';
import { UiStateService } from '../../core/services/ui-state.service';
import { PrefererService } from '../../core/services/preferer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CommentPanel],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  serverUrl = environment.serverUrl;
  user = signal<AuthResponse | null>(null);
  videos = signal<Video[]>([]);
  pausedStates = signal<Set<number>>(new Set());
  isMuted = signal<boolean>(true);
  likedVideos = signal<Set<number>>(new Set());
  selectedVideo = signal<Video | null>(null);
  showComments = signal(false);

  private intersectionObserver: IntersectionObserver | null = null;
  private manuallyPaused = new Set<number>();

  @ViewChildren('videoRef') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;

  constructor(
    private authService: AuthService,
    private videoService: VideoService,
    private likeService: LikeService,
    private uiState: UiStateService,
    private prefererService: PrefererService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.user.set(user);

    if (user?.id) {
      this.prefererService.getByUser(user.id).subscribe({
        next: (prefs) => {
          if (prefs.length === 0) {
            this.router.navigate(['/themes']);
            return;
          }
          this.videoService.getFeed().subscribe({
            next: data => this.videos.set(data),
            error: err => console.error('VIDEO ERROR:', err)
          });
        },
        error: () => {
          this.videoService.getFeed().subscribe({
            next: data => this.videos.set(data),
            error: err => console.error('VIDEO ERROR:', err)
          });
        }
      });

      this.likeService.getLikesByUser(user.id).subscribe({
        next: likes => {
          const ids = new Set(likes.filter(l => l.idVideo).map(l => l.idVideo!));
          this.likedVideos.set(ids);
        },
        error: err => console.error('LIKES ERROR:', err)
      });
    }
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    this.videoElements.changes.subscribe(() => this.setupIntersectionObserver());
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  private setupIntersectionObserver(): void {
    this.intersectionObserver?.disconnect();

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          const index = this.videoElements.toArray().findIndex(el => el.nativeElement === video);
          if (index === -1) return;

          if (entry.isIntersecting) {
            if (!this.manuallyPaused.has(index)) {
              video.play().catch(() => {});
              const states = new Set(this.pausedStates());
              states.delete(index);
              this.pausedStates.set(states);
            }
          } else {
            video.pause();
            const states = new Set(this.pausedStates());
            states.add(index);
            this.pausedStates.set(states);
          }
        });
      },
      { threshold: 0.6 }
    );

    this.videoElements.forEach(el => this.intersectionObserver!.observe(el.nativeElement));
  }

  isPaused(index: number): boolean {
    return this.pausedStates().has(index);
  }

  togglePlay(index: number): void {
    const videoEl = this.videoElements.get(index)?.nativeElement;
    if (!videoEl) return;

    const states = new Set(this.pausedStates());
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      states.delete(index);
      this.manuallyPaused.delete(index);
    } else {
      videoEl.pause();
      states.add(index);
      this.manuallyPaused.add(index);
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



  openComments(video: Video): void {
    this.selectedVideo.set(video);
    this.showComments.set(true);
    this.uiState.hideNav.set(true);
  }

  closeComments(): void {
    this.showComments.set(false);
    this.uiState.hideNav.set(false);
  }

  isLiked(videoId: number): boolean {
    return this.likedVideos().has(videoId);
  }

  toggleLike(video: Video): void {
    const user = this.user();
    if (!user?.id || !video.idVideo) return;

    const liked = this.isLiked(video.idVideo);
    const ids = new Set(this.likedVideos());

    if (liked) {
      ids.delete(video.idVideo);
      this.likedVideos.set(ids);
      this.likeService.unlikeVideo(user.id, video.idVideo).subscribe({
        error: () => {
          ids.add(video.idVideo!);
          this.likedVideos.set(new Set(ids));
        }
      });
    } else {
      ids.add(video.idVideo);
      this.likedVideos.set(ids);
      this.likeService.likeVideo(user.id, video.idVideo).subscribe({
        error: () => {
          ids.delete(video.idVideo!);
          this.likedVideos.set(new Set(ids));
        }
      });
    }
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
