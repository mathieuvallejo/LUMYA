import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthPop } from '../../auth-pop/auth-pop';

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
    AuthPop
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  
})
export class Register {
  prenom = '';
  nom = '';
  date : String | null = null;  
  email = '';
  password = '';
  showPwd = false;
  rememberMe = true;
  loading = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error' | ''>('');

  constructor(private http: HttpClient) {
    this.date = formatDate('2019-04-13T00:00:00', 'yyyy-MM-dd', 'en-US');
  }
  

  
  onSubmit() {
    if (!this.prenom || !this.nom || !this.date || !this.email || !this.password) {
      this.message.set('Veuillez remplir tous les champs');
      this.messageType.set('error');
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.messageType.set('');

    this.http.post(
      'http://localhost:3000/api/users',
      {
        prenom: this.prenom,
        nom: this.nom,
        date: this.date,
        email: this.email,
        password: this.password
      }
    ).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        this.message.set('Compte créé avec succès !');
        this.messageType.set('success');
        
        this.prenom = '';
        this.nom = '';
        this.date = null;
        this.email = '';
        this.password = '';
        
        setTimeout(() => {
          this.message.set('');
          this.messageType.set('');
        }, 2500);
      },
      error: (error) => {
        this.loading.set(false);
        if (error.status === 409) {
          this.message.set('Cet email est déjà utilisé');
        } else {
          this.message.set('Erreur lors de la création du compte');
        }
        this.messageType.set('error');
      }
    });
  }


    loginWithGoogle() {
    console.log('Redirection vers Google OAuth');
  }

  loginWithApple() {
    console.log('Redirection vers Apple OAuth');
  }
}
