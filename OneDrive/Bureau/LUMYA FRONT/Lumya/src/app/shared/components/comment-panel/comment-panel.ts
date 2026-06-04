import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommentaireService, CommentaireWithUser } from '../../../core/services/commentaire.service';
import { LikeService } from '../../../core/services/like.service';
import { UserService } from '../../../core/services/user.service';
import { Video } from '../../../core/services/video.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-comment-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-panel.html',
  styleUrl: './comment-panel.scss'
})
export class CommentPanel implements OnChanges {
  @Input() video: Video | null = null;
  @Input() isOpen = false;
  @Input() currentUser: any = null;
  @Output() closed = new EventEmitter<void>();

  comments = signal<CommentaireWithUser[]>([]);
  likedCommentIds = signal<Set<number>>(new Set());
  isLoading = signal(false);
  newComment = '';
  serverUrl = environment.serverUrl;

  constructor(
    private commentaireService: CommentaireService,
    private likeService: LikeService,
    private userService: UserService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true && this.video?.idVideo) {
      this.loadComments(this.video.idVideo);
      this.loadLikedComments();
    }
    if (changes['isOpen']?.currentValue === false) {
      this.comments.set([]);
      this.newComment = '';
    }
  }

  private loadComments(idVideo: number): void {
    this.isLoading.set(true);
    this.commentaireService.getByVideo(idVideo).subscribe({
      next: (comments) => {
        const userIds = [...new Set(comments.map(c => c.idUser))];
        if (userIds.length === 0) {
          this.comments.set([]);
          this.isLoading.set(false);
          return;
        }
        const requests = userIds.map(id =>
          this.userService.getById(id).pipe(catchError(() => of({ id, idUser: id, prenom: 'Utilisateur', nom: '', pdp: '' })))
        );
        forkJoin(requests).subscribe({
          next: (users) => {
            const userMap = new Map(users.map(u => [(u.idUser ?? u.id), u]));
            this.comments.set(comments.map(c => {
              const u = userMap.get(c.idUser);
              return {
                ...c,
                userPrenom: u?.prenom || '',
                userNom: u?.nom || '',
                userPdp: u?.pdp ? `${this.serverUrl}/${u.pdp.replace(/^\/+/, '')}` : '',
              };
            }));
            this.isLoading.set(false);
          },
          error: () => {
            this.comments.set(comments);
            this.isLoading.set(false);
          }
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  private loadLikedComments(): void {
    if (!this.currentUser?.id) return;
    this.likeService.getLikesByUser(this.currentUser.id).subscribe({
      next: (likes) => {
        const ids = new Set(likes.filter(l => l.idCommentaire).map(l => l.idCommentaire!));
        this.likedCommentIds.set(ids);
      }
    });
  }

  isCommentLiked(idCommentaire: number): boolean {
    return this.likedCommentIds().has(idCommentaire);
  }

  toggleCommentLike(comment: CommentaireWithUser): void {
    if (!this.currentUser?.id || !comment.idCommentaire) return;
    const liked = this.isCommentLiked(comment.idCommentaire);
    const ids = new Set(this.likedCommentIds());

    if (liked) {
      ids.delete(comment.idCommentaire);
      this.likedCommentIds.set(ids);
      this.likeService.unlikeCommentaire(this.currentUser.id, comment.idCommentaire).subscribe({
        error: () => {
          ids.add(comment.idCommentaire!);
          this.likedCommentIds.set(new Set(ids));
        }
      });
    } else {
      ids.add(comment.idCommentaire);
      this.likedCommentIds.set(ids);
      this.likeService.likeCommentaire(this.currentUser.id, comment.idCommentaire).subscribe({
        error: () => {
          ids.delete(comment.idCommentaire!);
          this.likedCommentIds.set(new Set(ids));
        }
      });
    }
  }

  postComment(): void {
    const text = this.newComment.trim();
    if (!text || !this.currentUser?.id || !this.video?.idVideo) return;
    this.newComment = '';

    this.commentaireService.create({
      contenuCommentaire: text,
      idVideo: this.video.idVideo,
      idUser: this.currentUser.id,
    }).subscribe({
      next: (created) => {
        this.comments.set([...this.comments(), {
          ...created,
          userPrenom: this.currentUser.prenom || this.currentUser.firstName || '',
          userNom: this.currentUser.nom || this.currentUser.lastName || '',
        }]);
      }
    });
  }

  deleteComment(comment: CommentaireWithUser): void {
    if (!comment.idCommentaire) return;
    this.commentaireService.remove(comment.idCommentaire).subscribe({
      next: () => {
        this.comments.set(this.comments().filter(c => c.idCommentaire !== comment.idCommentaire));
      }
    });
  }

  getInitials(prenom?: string, nom?: string): string {
    const p = (prenom || '').charAt(0).toUpperCase();
    const n = (nom || '').charAt(0).toUpperCase();
    return (p + n) || '?';
  }

  formatDate(date?: Date | string): string {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${Math.floor(hours / 24)}j`;
  }

  close(): void {
    this.closed.emit();
  }
}
