import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { AuthPop } from '../../../shared/components/auth-pop/auth-pop';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    AuthPop
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  showPwd = false;
  rememberMe = true;
  loading = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error' | ''>('');

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPwd = !this.showPwd;
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.message.set('Veuillez remplir tous les champs');
      this.messageType.set('error');
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.messageType.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set('Connexion réussie !');
        this.messageType.set('success');
        this.email = '';
        this.password = '';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);
      },
      error: (err: any) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.message.set('Email ou mot de passe incorrect');
        } else {
          this.message.set('Erreur lors de la connexion');
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
