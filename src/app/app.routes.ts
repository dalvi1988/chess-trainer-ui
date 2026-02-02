import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Openings } from './pages/openings/openings';
import { Openingdetails } from './pages/openingdetails/openingdetails';
import { Login } from './pages/login/login';
import { LoginSuccess } from './pages/login-success/login-success';
import { AuthGuard } from './guards/auths.guard';
import { SignIn } from './pages/login/signin/signin';
import { Signup } from './pages/login/signup/signup';
import { VerifyEmail } from './pages/login/verifymail/verifymail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'openings/:name', component: Openingdetails, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'login/success', component: LoginSuccess },
  { path: 'manual-login', component: SignIn },
  { path: 'openings', component: Openings, canActivate: [AuthGuard] },
  { path: 'signup', component: Signup },
  { path: 'verify-email', component: VerifyEmail },
];
