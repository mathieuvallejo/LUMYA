import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatSnackBarModule,
    RouterLink,
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

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  togglePasswordVisibility() {
    this.showPwd = !this.showPwd;
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.snackBar.open('Veuillez remplir tous les champs', 'Fermer', {
        duration: 3000,
        panelClass: ['snack-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    this.loading.set(true);

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.email = '';
        this.password = '';
        this.snackBar.open('Connexion réussie !', '', {
          duration: 1500,
          panelClass: ['snack-success'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg = err.status === 401 ? 'Email ou mot de passe incorrect' : 'Erreur lors de la connexion';
        this.snackBar.open(msg, 'Fermer', {
          duration: 4000,
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
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
