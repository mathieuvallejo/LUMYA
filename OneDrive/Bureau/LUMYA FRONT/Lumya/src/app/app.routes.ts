import { Routes } from '@angular/router';
import { Login } from './user/login';
import { Register } from './user/register/register';
import { Home } from './home/home';
<<<<<<< HEAD
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
=======
import { Profile } from './profile/profile';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'home',
    component: Home
  },
   {
    path: 'profile',
    component: Profile  
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
>>>>>>> 2d3d81a964a8829075ca4d26731e3882aea43f56
];
