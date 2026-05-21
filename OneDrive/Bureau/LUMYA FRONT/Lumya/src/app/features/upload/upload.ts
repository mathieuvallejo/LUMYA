import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { VideoService } from '../../core/services/video.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.scss'
})
export class Upload {
  titre = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  uploadProgress = 0;
  successMessage = '';
  errorMessage = '';

  constructor(
    private videoService: VideoService,
    private authService: AuthService,
    private router: Router
  ) {}

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
          this.uploading = false;
          this.uploadProgress = 100;
          this.router.navigate(['/home']);
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
