declare var google:any
import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogEmailComponent,
  DialogTermsComponent,
} from '../dialog/dialog.component';
import { CommonModule } from '@angular/common';
import { PrimeNGModule } from '../../../material/primeng.module';
import {
  CountryISO,
  NgxIntlTelInputModule,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { AuthenticationService } from '../../../services/authentication.service';
interface PhoneModel {
  number: any;
  internationalNumber: any;
  nationalNumber: any;
  e164Number: any;
  countryCode: any;
  dialCode: any;
}

@Component({
  selector: 'healthnable-register',
  standalone: true,
  imports: [
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    CommonModule,
    PrimeNGModule,
    NgxIntlTelInputModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  token:any
  form!: FormGroup;
  preferredCountries: CountryISO[] = [CountryISO.India];
  SearchCountryField = SearchCountryField;
  selectedCountryISO: CountryISO = CountryISO.India;
  CountryISO = CountryISO;
  emailId: string = '';
  inputType = 'password';
  inputType1 = 'password';
  isTermsChecked: boolean = false;
  constructor(
    public dialog: MatDialog,
    private _authenticationService: AuthenticationService,
    private _healtnableCoreService: HealthnableCoreService,
    private router: Router
  ) {}
  ngOnInit() {
//     google.accounts.id.initialize({
//       // client_id:'781871620464-fi14efjps2bhpev289139lk4ficcv1g1.apps.googleusercontent.com',
//       client_id:'6003739462-km5rgmf9je55eh1cm8c1k8hs8uj7poas.apps.googleusercontent.com',
//       callback:(resp:any)=>{
// this.handleLogin(resp)
//       }
//     });
    // google.accounts.id.renderButton(document.getElementById('google-btn'),{
    //   theme:'filled_white',
    //   size:'medium',
    //   shape:'rectangle',
    //   width:190,

    // })
    this.form = new FormGroup(
      {
        username: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(70),
          Validators.pattern(this._healtnableCoreService.regEx.userName),
        ]),
        email: new FormControl('', [
          Validators.required,
           Validators.minLength(5),
          Validators.maxLength(100),
          Validators.pattern(
            this._healtnableCoreService.regEx.email,
          ),
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
          Validators.pattern(this._healtnableCoreService.regEx.password)
        ]),
        confirm_password: new FormControl('', [Validators.required]),
        phone_number: new FormControl('', [Validators.required]),
        countryCode: new FormControl('', []),
      },
      { validators: this.passwordMatchValidator }
    );
  }
  passwordMatchValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const resetPassword = form.get('confirm_password')?.value;
    if (password && resetPassword && password !== resetPassword) {
      return { mismatch: true };
    }
    return null;
  }
  isChecked(ev: boolean) {
    this.isTermsChecked = ev;
  }
  get f() {
    return this.form.controls;
  }
  getType(inputType: any) {
    this.inputType = inputType;
  }
  getType1(inputType: any) {
    this.inputType1 = inputType;
  }
  submit() {
    if (this.form.valid && this.isTermsChecked) {
      let phoneDetails: PhoneModel;
      phoneDetails = this.form.get('phone_number')?.value;
      const phoneNumber = phoneDetails?.number?.replace(/\s+/g, '') || '';
      const dialCode = phoneDetails.dialCode || '';
      this.form.get('countryCode')?.setValue(dialCode);
      if (this.isTermsChecked) {
        this.emailId = this.form.value.email;
        this.form.patchValue({
          phone_number: phoneNumber,
        });
        this._authenticationService.register(this.form.value).subscribe({
          next: (data: any) => {
            this._healtnableCoreService.apiSuccess(data.message);
            let dialogRef = this.dialog.open(DialogEmailComponent, {
        width: '500px',
        data: this.emailId,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.form.reset();
        this.router.navigate(['/login']);
      });
          },
        });
      }
      
    }
  }
  termsAndCondition() {
    this.dialog.open(DialogTermsComponent);
  }

  google() {
    window.open('https://accounts.google.com/', '_blank');
  }
  onUsernameChange(event: any): void {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, ''); 
    inputValue = inputValue.replace(/[^a-zA-Z'\- ]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.form.get('username')?.setValue(inputValue, { emitEvent: false });
  }

  onEmailChange(event:any):void{
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/\s+/g, '');
    this.form.get('email')?.setValue(inputValue, { emitEvent: false });
  }
//   handleLogin(response: any){
//     if (response && response.credential) {
//       const idToken=response.credential
//   this._authenticationService.googleSignIn(idToken).subscribe({
//     next:(data:any)=>{
//       this._healtnableCoreService.apiSuccess(data.message);
//       this.router.navigate(['/dashboards/dashboard'])
//     }
//   })
 
// }
//   }
}
