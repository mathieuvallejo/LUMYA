import { Routes } from '@angular/router';
import { Login } from './user/login';
import { Register } from './user/register/register';
import { Home } from './home/home';
import { Messages } from './messages/messages';
import { Upload } from './upload/upload';
import { Profile } from './profile/profile';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'messages', component: Messages, canActivate: [authGuard] },
  { path: 'upload', component: Upload, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
