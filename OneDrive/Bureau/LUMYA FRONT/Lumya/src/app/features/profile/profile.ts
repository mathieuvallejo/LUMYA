import { CommonModule } from '@angular/common';
import { Component, signal, AfterViewInit, OnInit, ElementRef, ViewChild } from '@angular/core';
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
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';


Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);


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

export class Profile implements OnInit {
    @ViewChild('barchart') barChartRef!: ElementRef<HTMLCanvasElement>;

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
  saveLoading = signal(false);
  saveMessage = signal('');

  displayName = signal('');
  displayDescription = signal('');

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.displayName.set(user.prenom || user.firstName || user.name || '');
    this.displayDescription.set(user.description || '');

    if (user.id) {
      this.http.get<any>(`http://localhost:3000/api/users/${user.id}`).subscribe({
        next: (data) => {
          this.displayName.set(data.prenom || data.firstName || data.name || '');
          this.displayDescription.set(data.description || '');
          const updated = { ...user, ...data };
          this.authService.updateCurrentUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        },
        error: () => {}
      });
    }
  }

  ngAfterViewInit() {
    new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Triste', 'Joie', 'Anxiété'],
        datasets: [{
          label: 'Nombre de fois',
          data: [12, 13, 14],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
          ],
          borderWidth: 1
        }]
      }
    });
  }

  openEditModal() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.editPrenom = user.prenom || user.firstName || '';
      this.editNom = user.nom || user.lastName || '';
      this.editDateNaissance = user.dateNaissance || user.date || '';
      this.editDescription = user.description || '';
    }
    this.saveMessage.set('');
    this.showEditModal.set(true);
  }
  closeEditModal() { this.showEditModal.set(false); }

  saveProfile() {
    const user = this.authService.getCurrentUser();
    if (!user?.id) return;

    this.saveLoading.set(true);
    this.saveMessage.set('');

    const payload: any = {
      prenom: this.editPrenom,
      nom: this.editNom,
      description: this.editDescription,
    };
    if (this.editDateNaissance) payload['date'] = this.editDateNaissance;

    this.http.put(`http://localhost:3000/api/users/${user.id}`, payload).subscribe({
      next: () => {
        const updated = { ...user, ...payload, firstName: payload.prenom, lastName: payload.nom };
        localStorage.setItem('user', JSON.stringify(updated));
        this.authService.updateCurrentUser(updated);
        this.displayName.set(payload.prenom);
        this.displayDescription.set(payload.description);
        this.saveLoading.set(false);
        this.closeEditModal();
      },
      error: () => {
        this.saveMessage.set('Erreur lors de la sauvegarde');
        this.saveLoading.set(false);
      }
    });
  }
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
