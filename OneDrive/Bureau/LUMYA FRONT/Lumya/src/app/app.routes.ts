import { Routes } from '@angular/router';
import { Login } from './user/login';
import { Register } from './user/register/register';
import { Home } from './home/home';

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
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
