import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthenticationRoutes } from './authentication-routing.module';
import { LoginComponent } from './login/login.component';
//icons
import { MaterialModule } from '../../material/material.module';
import { RegisterComponent } from './register/register.component';
import { DialogForgotPasswordComponent } from './dialog/dialog.component';
import { ErrorComponent } from './error/error.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthenticationRoutes),
    DialogForgotPasswordComponent,
    MaterialModule,
    LoginComponent,
RegisterComponent,
ErrorComponent
  ],
  declarations: [
  ]
})
export class AuthenticationModule {}
