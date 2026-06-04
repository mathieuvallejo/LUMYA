import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { PrefererService } from '../../core/services/preferer.service';
import { AuthService } from '../../core/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-theme-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-selection.html',
  styleUrl: './theme-selection.scss'
})
export class ThemeSelection implements OnInit {
  themes = signal<Theme[]>([]);
  selectedIds = signal<Set<number>>(new Set());
  isLoading = signal(false);
  isSaving = signal(false);

  constructor(
    private themeService: ThemeService,
    private prefererService: PrefererService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading.set(true);
    const user = this.authService.getCurrentUser();

    this.themeService.getAll().subscribe({
      next: (themes) => {
        const unique = themes.filter((t, i, arr) => arr.findIndex(x => x.idTheme === t.idTheme) === i);
        this.themes.set(unique);
        if (user?.id) {
          this.prefererService.getByUser(user.id).subscribe({
            next: (prefs) => {
              this.selectedIds.set(new Set(prefs.map(p => p.idTheme)));
              this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
          });
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  isSelected(idTheme: number): boolean {
    return this.selectedIds().has(idTheme);
  }

  toggle(idTheme: number): void {
    const ids = new Set(this.selectedIds());
    if (ids.has(idTheme)) {
      ids.delete(idTheme);
    } else {
      ids.add(idTheme);
    }
    this.selectedIds.set(ids);
  }

  save(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id || this.selectedIds().size === 0) return;

    this.isSaving.set(true);
    const idUser = user.id;

    this.prefererService.getByUser(idUser).subscribe({
      next: (existing) => {
        const existingIds = new Set(existing.map(p => p.idTheme));
        const toAdd = [...this.selectedIds()].filter(id => !existingIds.has(id));
        const toRemove = [...existingIds].filter(id => !this.selectedIds().has(id));

        const requests = [
          ...toAdd.map(idTheme => this.prefererService.add(idUser, idTheme)),
          ...toRemove.map(idTheme => this.prefererService.remove(idUser, idTheme)),
        ];

        if (requests.length === 0) {
          this.router.navigate(['/home']);
          return;
        }

        forkJoin(requests).subscribe({
          next: () => this.router.navigate(['/home']),
          error: () => {
            this.isSaving.set(false);
          }
        });
      },
      error: () => this.isSaving.set(false)
    });
  }
}
