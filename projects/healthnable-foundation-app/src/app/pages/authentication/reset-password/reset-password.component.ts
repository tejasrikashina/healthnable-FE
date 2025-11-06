import { Component, Inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeNGModule } from '../../../material/primeng.module';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [MaterialModule,ReactiveFormsModule,PrimeNGModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit{
  resetPassword!:FormGroup
  inputType = 'password';
  inputType1 = 'password';
email:any
decodedEmail:any
constructor(private fb:FormBuilder,
 private _authenticationService: AuthenticationService,
 private activatedRoute: ActivatedRoute,
 private router: Router,
   private _healtnableCoreService: HealthnableCoreService,) {
    this.activatedRoute.params.subscribe((param: any) => {
      this.email = param['email'];

    })
    }

ngOnInit(){
  this.resetPassword = this.fb.group({
    new_password: ['', [Validators.required,  Validators.minLength(8),
      Validators.maxLength(16),
      Validators.pattern(this._healtnableCoreService.regEx.password)]],
      confirm_password:['', [Validators.required]],
   
  },
  { validators: this.passwordMatchValidator }
);
}
getType(inputType: any) {
  this.inputType = inputType;
}
getType1(inputType: any) {
  this.inputType1 = inputType;
}
get f() {
  return this.resetPassword.controls;
} 
passwordMatchValidator(form: AbstractControl): { [key: string]: boolean } | null {
  const password = form.get('confirm_password')?.value;
  const resetPassword = form.get('new_password')?.value;
  if (password && resetPassword && password !== resetPassword) {
    return { mismatch: true };
  }
  return null;
}
onPasswordChange(event: any): void {
  let inputValue = event.target.value;
inputValue = inputValue.substring(0, 16);
}
submit(){
 this._authenticationService.resetPassword(this.email,this.resetPassword.value).subscribe({
  next:(data:any)=>{
    this._healtnableCoreService.apiSuccess(data.message);
    this.router.navigate(['/login'])
  }
 })
 
}
cancel(){
  this.router.navigate(['/login'])
}
}
