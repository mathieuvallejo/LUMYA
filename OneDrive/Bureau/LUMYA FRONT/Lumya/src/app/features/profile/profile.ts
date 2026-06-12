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
import { MoodPicker, Mood } from '../../shared/components/mood-picker/mood-picker';
import { environment } from '../../../environments/environment';
import { PrefererService, Preference } from '../../core/services/preferer.service';
import { HumeurService, Humeur } from '../../core/services/humeur.service';
import { Router } from '@angular/router';
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

export class Profile implements OnInit, AfterViewInit {
  @ViewChild('barchart') barChartRef!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;
  private readonly moodOrder = ['fatigue', 'anxieux', 'colere', 'triste', 'stresse', 'joie'];

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
  editEmail = '';
  editDateNaissance = '';
  saveLoading = signal(false);
  saveMessage = signal('');

  displayName = signal('');
  profilePhotoUrl = signal<string>('');
  userThemes = signal<Preference[]>([]);
  serverUrl = environment.serverUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private prefererService: PrefererService,
    private humeurService: HumeurService,
    private router: Router
  ) {}

  goToThemes(): void {
    this.router.navigate(['/themes']);
  }

  getPhotoUrl(photoProfil?: string): string {
    if (!photoProfil) return '';
    return this.serverUrl + '/' + photoProfil.replace(/^\/+/, '');
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    console.log('[Profile] user depuis localStorage:', user);
    if (!user) return;

    this.displayName.set(user.prenom || user.firstName || user.name || '');
    if (user.pdp) {
      this.profilePhotoUrl.set(this.getPhotoUrl(user.pdp));
      console.log('[Profile] photo depuis localStorage:', this.profilePhotoUrl());
    }

    if (user.id) {
      this.prefererService.getByUser(user.id).subscribe({
        next: prefs => this.userThemes.set(prefs),
        error: () => {}
      });

      this.http.get<any>(`${this.serverUrl}/api/users/${user.id}`).subscribe({
        next: (data) => {
          console.log('[Profile] réponse GET /api/users/:id :', data);
          this.displayName.set(data.prenom || data.firstName || data.name || '');
          if (data.pdp) {
            this.profilePhotoUrl.set(this.getPhotoUrl(data.pdp));
            console.log('[Profile] URL photo construite:', this.profilePhotoUrl());
          } else {
            console.warn('[Profile] pdp absent dans la réponse API');
          }
          const updated = { ...user, ...data };
          this.authService.updateCurrentUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        },
        error: (err) => console.error('[Profile] erreur GET user:', err)
      });
    }
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const user = this.authService.getCurrentUser();
    if (!user?.id) return;

    console.log('[Profile] fichier sélectionné:', file.name, file.type, file.size);

    const reader = new FileReader();
    reader.onload = (e) => this.profilePhotoUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('photo', file);

    this.http.put<any>(`${this.serverUrl}/api/users/${user.id}/pdp`, formData).subscribe({
      next: (data) => {
        console.log('[Profile] réponse PUT /pdp:', data);
        if (data?.pdp) {
          this.profilePhotoUrl.set(this.getPhotoUrl(data.pdp));
          console.log('[Profile] URL photo après upload:', this.profilePhotoUrl());
          const updated = { ...user, pdp: data.pdp };
          this.authService.updateCurrentUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        } else {
          console.warn('[Profile] pdp absent dans la réponse PUT');
        }
      },
      error: (err) => console.error('[Profile] erreur upload photo:', err)
    });
  }

  ngAfterViewInit() {
    const moodLabels = ['Fatigué', 'Anxieux', 'En colère', 'Triste', 'Stressé', 'Joie'];
    const moodColors = [
      'rgba(148, 163, 184, 0.8)',
      'rgba(167, 139, 250, 0.8)',
      'rgba(248, 113, 113, 0.8)',
      'rgba(96, 165, 250, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(74, 222, 128, 0.8)',
    ];

    this.chartInstance = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: moodLabels,
        datasets: [{
          label: 'Nombre de fois',
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: moodColors,
          borderColor: moodColors.map(c => c.replace('0.8', '1')),
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });

    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.humeurService.getByUser(user.id).subscribe({
        next: (humeurs: Humeur[]) => {
          const counts = this.moodOrder.map((id: string) => humeurs.filter(h => h.humeurs === id).length);
          this.chartInstance!.data.datasets[0].data = counts;
          this.chartInstance!.update();
        }
      });
    }
  }

  onMoodSelected(mood: Mood) {
    if (!this.chartInstance) return;
    const idx = this.moodOrder.indexOf(mood.id);
    if (idx === -1) return;
    const data = this.chartInstance.data.datasets[0].data as number[];
    data[idx] = (data[idx] ?? 0) + 1;
    this.chartInstance.update();
  }

  openEditModal() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.editPrenom = user.prenom || user.firstName || this.displayName() || '';
      this.editNom = user.nom || user.lastName || '';
      this.editEmail = user.email || '';
      this.editDateNaissance = user.dateNaissance || user.date || '';
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

    const payload: any = {};
    if (this.editPrenom) payload['prenom'] = this.editPrenom;
    if (this.editNom) payload['nom'] = this.editNom;
    if (this.editEmail) payload['email'] = this.editEmail;
    if (this.editDateNaissance) payload['date'] = this.editDateNaissance;

    this.http.put(`http://localhost:3000/api/users/${user.id}`, payload).subscribe({
      next: () => {
        const updated = { ...user, ...payload, firstName: payload.prenom ?? user.prenom ?? user.firstName, lastName: payload.nom ?? user.nom ?? user.lastName };
        localStorage.setItem('user', JSON.stringify(updated));
        this.authService.updateCurrentUser(updated);
        if (payload.prenom) this.displayName.set(payload.prenom);
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
