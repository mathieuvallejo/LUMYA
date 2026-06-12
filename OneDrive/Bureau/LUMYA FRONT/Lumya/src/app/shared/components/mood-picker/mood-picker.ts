import { Component, signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HumeurService } from '../../../core/services/humeur.service';
import { AuthService } from '../../../core/services/auth.service';

export interface Mood {
  id: string;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-mood-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mood-picker.html',
  styleUrl: './mood-picker.scss'
})
export class MoodPicker {
  private humeurService = inject(HumeurService);
  private authService = inject(AuthService);

  selected = signal<string | null>(null);
  saving = signal(false);
  saved = signal(false);
  moodSelected = output<Mood>();

  moods: Mood[] = [
    { id: 'fatigue',  label: 'Fatigué',   emoji: '<img src="https://i.imgur.com/oBtG6vR.png" alt="Fatigué">' },
    { id: 'anxieux',  label: 'Anxieux',   emoji: '<img src="https://i.imgur.com/9qeMGRl.png" alt="Anxieux">' },
    { id: 'colere',   label: 'En colère', emoji: '<img src="https://i.imgur.com/786qQXL.png" alt="Colère">' },
    { id: 'triste',   label: 'Triste',    emoji: '<img src="https://i.imgur.com/JtcBrS8.png" alt="Triste">' },
    { id: 'stresse',  label: 'Stressé',   emoji: '<img src="https://i.imgur.com/7xtM6Gn.png" alt="Stressé">' },
    { id: 'joie',  label: 'joie',   emoji: '<img src="https://i.imgur.com/pezGxZS.png" alt="joie">' },
  ];

  select(mood: Mood) {
    const user = this.authService.getCurrentUser();
    console.log('[MoodPicker] select appelé:', mood.id, '| user:', user?.id, '| saving:', this.saving());
    if (!user?.id || this.saving()) {
      console.warn('[MoodPicker] bloqué — user.id:', user?.id, '| saving:', this.saving());
      return;
    }

    this.selected.set(mood.id);
    this.saving.set(true);

    this.humeurService.create(mood.id, user.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.moodSelected.emit(mood);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: (err) => {
        console.error('[MoodPicker] erreur API:', err);
        this.saving.set(false);
      },
    });
  }
}
