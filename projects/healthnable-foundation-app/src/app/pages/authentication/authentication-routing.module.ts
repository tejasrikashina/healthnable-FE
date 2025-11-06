import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ErrorComponent } from './error/error.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [      
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'login/verify',
        loadComponent: () => import('./register-verification/register-verification.component')
          .then(m => m.RegisterVerificationComponent)
      },
      { path: 'reset_password/:email', component: ResetPasswordComponent },
      {
        path: '**',
        component: ErrorComponent,
      },
    ],
  },
];
