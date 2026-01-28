import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Openings } from './pages/openings/openings';
import { Openingdetails } from './pages/openingdetails/openingdetails';
import { Login } from './pages/login/login';
import { LoginSuccess } from './pages/login-success/login-success';
import { AuthGuard } from './guards/auths.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'openings/:id', component: Openingdetails, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'login/success', component: LoginSuccess },
  { path: 'openings', component: Openings, canActivate: [AuthGuard] },
];
