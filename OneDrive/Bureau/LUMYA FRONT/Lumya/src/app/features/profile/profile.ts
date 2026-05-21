import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthPop } from '../../shared/components/auth-pop/auth-pop';
import { AuthService } from '../../core/services/auth.service';
import { MoodPicker } from '../../shared/components/mood-picker/mood-picker';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AuthPop,
    MoodPicker
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})

export class Profile {
  nom = '';
  siret = '';
  verify = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error' | ''>('');
  showEditModal = signal(false);
  showSiretModal = signal(false);
  showNumModal = signal(false);
  editNom = '';
  editPrenom = '';
  editDateNaissance = '';
  editDescription = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  openEditModal() { this.showEditModal.set(true); }
  closeEditModal() { this.showEditModal.set(false); }
  openSiretModal() { this.showSiretModal.set(true); }
  closeSiretModal() { this.showSiretModal.set(false); }
  openNumModal() { this.showNumModal.set(true); }
  closeNumModal() { this.showNumModal.set(false); }

  onSubmit() {
    if (!this.nom || !this.siret) {
      this.message.set('Veuillez remplir tous les champs');
      this.messageType.set('error');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.message.set('Utilisateur non connecté');
      this.messageType.set('error');
      return;
    }

    this.verify.set(true);
    this.message.set('');
    this.messageType.set('');

    this.http.post(
      'http://localhost:3000/api/pro/verify',
      { nom: this.nom, siret: this.siret }
    ).subscribe({
      next: () => {
        this.http.put(
          `http://localhost:3000/api/pro/upgrade/${currentUser.id}`,
          { nom: this.nom, siret: this.siret }
        ).subscribe({
          next: () => {
            this.verify.set(false);
            this.message.set('Compte pro créé avec succès !');
            this.messageType.set('success');
            this.nom = '';
            this.siret = '';
          },
          error: () => {
            this.verify.set(false);
            this.message.set('Erreur lors de la mise à jour du compte');
            this.messageType.set('error');
          }
        });
      },
      error: (error) => {
        this.verify.set(false);
        this.message.set(error.error?.error ?? 'Professionnel non trouvé');
        this.messageType.set('error');
      }
    });
  }


}
