import { Component, Inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { MaterialModule } from '../../../material/material.module';
import { Router } from '@angular/router';
import { PrimeNGModule } from '../../../material/primeng.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators ,AbstractControl} from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { UserData } from '../../../type-models/authentication';
@Component({
  selector: 'dialog-terms',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: 'dialog-terms.component.html',
})
export class DialogTermsComponent{}
@Component({
  selector: 'dialog-forgot-password',
    standalone: true,
    imports: [MaterialModule,PrimeNGModule,ReactiveFormsModule],
    templateUrl: 'dialog-forgot-password.component.html',
      styleUrl: 'dialog.component.scss'
})
export class DialogForgotPasswordComponent implements OnInit{
constructor(private router:Router,public dialogRef: MatDialogRef<DialogForgotPasswordComponent>,private fb:FormBuilder,private _healtnableCoreService:HealthnableCoreService, private _authenticationService:AuthenticationService) { }
forgotPassword!:FormGroup
ngOnInit(){
  this.forgotPassword = this.fb.group({
    email: ['', [Validators.required,Validators.pattern(this._healtnableCoreService.regEx.email)]],
  });
}
get f() {
  return this.forgotPassword.controls;
}
submitfP(){
  this._authenticationService.forgotPassword(this.forgotPassword.value).subscribe({
    next: (data:any)=>{
      this._healtnableCoreService.apiSuccess(data.message)
      localStorage.setItem('email', this.forgotPassword.value);
      this.dialogRef.close();
    }
  })
}
}
@Component({
  selector: 'dialog-email',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: 'dialog-email.component.html',
  styleUrl: 'dialog.component.scss'
})
export class DialogEmailComponent{
  constructor(public dialogRef: MatDialogRef<DialogEmailComponent>,@Inject(MAT_DIALOG_DATA) public data:string, private router:Router){
  }

  onCancel()
  {
    this.dialogRef.close();
  
  }
  submit(){
    this.dialogRef.close();
    this.router.navigate(['/register'])
  }
}


@Component({
  selector: 'dialog-2FA',
  standalone: true,
  imports: [MaterialModule, PrimeNGModule, FormsModule],
  templateUrl: 'dialog-2FA.component.html',
  styleUrl: 'dialog.component.scss'
})
export class Dialog2FAComponent{
  otp:string=''
  show:boolean=true
val:number=6
userData!:UserData
otpData: { email_or_phone: string; otp: string };
  constructor(public dialogRef: MatDialogRef<Dialog2FAComponent>, private _healtnableCoreService:HealthnableCoreService,  
    private router:Router,@Inject(MAT_DIALOG_DATA) public logindata:string,
private _authenticationService:AuthenticationService){
  this.otpData = {
    email_or_phone: this.logindata,
    otp: this.otp
  };
  }
  // otpNum!:string
  // show:boolean=true
  // otpConfig = {
  //   length: 6, 
  //   hasMask: true, 
  //   inputClass:'digit-otp',
  //   isPasswordInput: false,  
  //   inputType: 'number',  
  //   allowNumbersOnly:true
  // };
  // onOtpChange(otp: any) {
  //  this.otpNum=otp
  //  if(this.otpNum.length===this.otpConfig.length){
  //   this.show=false
  //  }
  // }
  resendOtp(){
    this.otpData.otp=''
    this._authenticationService.resendOtp({ email_or_phone: this.otpData.email_or_phone }).subscribe({
      next:(data:any)=>{
        this._healtnableCoreService.apiSuccess(data.message)
      }
    })
  }

  onCancel()
  {
    this.dialogRef.close();
  }
  verifyOtp(){
    this._authenticationService.otpVerification(this.otpData).subscribe({
      next:(data:any)=>{
   this.userData=data
      if(data){
        this._healtnableCoreService.apiSuccess(data.message)
        sessionStorage.setItem('currentUser', JSON.stringify(this.userData));
   this.router.navigate(['/dashboards/dashboard'])
   this.dialogRef.close();
      }
      }
    })
   
  }
}