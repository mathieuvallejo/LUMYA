import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  selected = signal<string | null>(null);
  moodSelected = output<Mood>();

  moods: Mood[] = [
    { id: 'fatigue',  label: 'Fatigué',   emoji: '<img src="https://i.imgur.com/oBtG6vR.png" alt="Fatigué">' },
    { id: 'anxieux',  label: 'Anxieux',   emoji: '<img src="https://i.imgur.com/9qeMGRl.png" alt="Anxieux">' },
    { id: 'colere',   label: 'En colère', emoji: '<img src="https://i.imgur.com/786qQXL.png" alt="Colère">' },
    { id: 'triste',   label: 'Triste',    emoji: '<img src="https://i.imgur.com/JtcBrS8.png" alt="Triste">' },
    { id: 'stresse',  label: 'Stressé',   emoji: '<img src="https://i.imgur.com/7xtM6Gn.png" alt="Stressé">' },
    { id: 'heureux',  label: 'Heureux',   emoji: '<img src="https://i.imgur.com/pezGxZS.png" alt="Heureux">' },
  ];

  select(mood: Mood) {
    this.selected.set(mood.id);
    this.moodSelected.emit(mood);
  }
}
