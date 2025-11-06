import { Component, inject, OnInit ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Dialog2FAComponent, DialogForgotPasswordComponent } from '../dialog/dialog.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeNGModule } from '../../../material/primeng.module';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'healthnable-login',
  standalone: true,
  imports: [MaterialModule,RouterModule,TranslateModule,
    ReactiveFormsModule,FormsModule,PrimeNGModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent implements OnInit{
 constructor( private fb: FormBuilder,public dialog:MatDialog, private router:Router,
   private _healtnableCoreService:HealthnableCoreService,private _authenticationService: AuthenticationService,){
  sessionStorage.clear();
 }
 loginForm!:FormGroup
 emailId: string = '';
  isRemChecked:boolean=false
  inputType = 'password';
ngOnInit(){

  this.loginForm = this.fb.group({
    email_or_phone: ['', [Validators.required, Validators.pattern(this._healtnableCoreService.regEx.email)]],
    password: ['', [Validators.required]],
    remember_me:[false]
  });
  const savedEmail = localStorage.getItem('email');
  const remembered = localStorage.getItem('remembered');

  if (savedEmail!="[object Object]" && remembered === 'true') {
    this.loginForm.patchValue({
      email_or_phone: savedEmail,
    });
  }

}
get f() {
  return this.loginForm.controls;
}
submit() {
  if(this.loginForm.valid){
    this.emailId = this.loginForm.value.email_or_phone;
   this._authenticationService.login(this.loginForm.value).subscribe({
    next: (data:any)=>{
      if(this.loginForm.value.remember_me  ){
        localStorage.setItem('email', this.loginForm.value.email_or_phone);
        localStorage.setItem('remembered', 'true'); 
      }
      else {
        
        if (!localStorage.getItem('remembered')) {
          localStorage.removeItem('email');
        }
      }
        this._healtnableCoreService.apiSuccess(data.message)
        let dialogRef = this.dialog.open(Dialog2FAComponent, { width: '500px',
          data:this.emailId ,
          disableClose: true});  
        dialogRef.afterClosed().subscribe((result) => {
          this.loginForm.reset();
        }); 

    }
   }) 
  }
 
}
isChecked(ev:boolean){
this.loginForm.value.remember_me=ev
}
forgotPassword(){
  let dialogRef = this.dialog.open(DialogForgotPasswordComponent, { width: '400px' ,disableClose: true});  
  dialogRef.afterClosed().subscribe((result) => {
    this.loginForm.reset();
  }); 
} 
getType(inputType: any) {
  this.inputType = inputType;
}


}