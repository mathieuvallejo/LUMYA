import { Routes } from '@angular/router';
import { Login } from './user/login';
import { Register } from './user/register/register';
import { Home } from './home/home';
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
];
