import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VideoService } from '../../core/services/video.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { TraiterService } from '../../core/services/traiter.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.scss'
})
export class Upload implements OnInit {
  titre = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  uploadProgress = 0;
  successMessage = '';
  errorMessage = '';

  themes = signal<Theme[]>([]);
  selectedThemeIds = signal<Set<number>>(new Set());

  constructor(
    private videoService: VideoService,
    private authService: AuthService,
    private themeService: ThemeService,
    private traiterService: TraiterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.getAll().subscribe({
      next: (themes) => {
        const unique = themes.filter((t, i, arr) => arr.findIndex(x => x.idTheme === t.idTheme) === i);
        this.themes.set(unique);
      }
    });
  }

  isThemeSelected(idTheme: number): boolean {
    return this.selectedThemeIds().has(idTheme);
  }

  toggleTheme(idTheme: number): void {
    const ids = new Set(this.selectedThemeIds());
    if (ids.has(idTheme)) {
      ids.delete(idTheme);
    } else {
      ids.add(idTheme);
    }
    this.selectedThemeIds.set(ids);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (!this.titre.trim() || !this.selectedFile) return;

    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.errorMessage = 'Utilisateur non connecté.';
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;
    this.successMessage = '';
    this.errorMessage = '';

    this.videoService.uploadVideo(this.titre, this.selectedFile, user.id).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          const video = event.body;
          const themeIds = [...this.selectedThemeIds()];

          if (video?.idVideo && themeIds.length > 0) {
            forkJoin(themeIds.map(idTheme => this.traiterService.add(idTheme, video.idVideo!))).subscribe({
              next: () => this.router.navigate(['/home']),
              error: () => this.router.navigate(['/home'])
            });
          } else {
            this.router.navigate(['/home']);
          }
        }
      },
      error: (err) => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.errorMessage = err?.error?.error || 'Une erreur est survenue.';
      }
    });
  }
}
