import {  Component,CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { FeatherModule } from 'angular-feather';
import { TranslateModule } from '@ngx-translate/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../core-components/input/input.component';
import { MatDialogRef } from '@angular/material/dialog';
import {CountryISO, NgxIntlTelInputModule, SearchCountryField}  from 'ngx-intl-tel-input';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { IdentityManagementService } from '../../../../services/identity-management.service';
import { OrganizationService } from '../../../../services/organization.service';
@Component({
  selector: 'healthnable-edituser',
  standalone: true,
  imports: [MaterialModule,SelectComponent,TranslateModule,InputComponent,ReactiveFormsModule,PrimeNGModule,NgxIntlTelInputModule,StatusComponent,HeaderComponent],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditUserComponent implements OnInit{
  constructor(private router:Router,    private activatedRoute: ActivatedRoute, private _healthnableCoreService:HealthnableCoreService,
    private _healtnableCoreService: HealthnableCoreService,private _orgSer:OrganizationService,
    private _identitySer:IdentityManagementService){
      this.activatedRoute.params.subscribe((param: any) => {
      this.userId = param['userId'];
      this.getUserDetails();
    });
    }
    userId:any
  userForm!: FormGroup;
  status!:boolean;
  fb=inject(FormBuilder)
  role!: any[];
  department!:any[]
    inputType = 'password';
  inputType1 = 'password';
  ngOnInit(){
    this.getRole();
this.getDepNames()
  this.userForm = this.fb.group({
    first_name: ['', [Validators.required, Validators.minLength(3),
          Validators.maxLength(70),Validators.pattern(this._healtnableCoreService.regEx.userName)]],
    last_name: ['',[Validators.required, Validators.minLength(3),
          Validators.maxLength(70),Validators.pattern(this._healtnableCoreService.regEx.userName)]],
    email: ['',  [Validators.required,
          Validators.maxLength(100),
          Validators.pattern(this._healtnableCoreService.regEx.email)]],
    department:['',Validators.required],
    roles: ['', [Validators.required]],
    temporary_password: ['', [Validators.required,  Validators.minLength(8),
          Validators.maxLength(16),
          Validators.pattern(this._healtnableCoreService.regEx.password)]],
    password: ['', [Validators.required]],
    status: [true],
  },
     { validators: this.passwordMatchValidator }
);
 
}
 passwordMatchValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const password = form.get('temporary_password')?.value;
    const confirmPassword = form.get('password')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }
    get f() {
    return this.userForm.controls;
  }
  getType(inputType: any) {
    this.inputType = inputType;
  }
    getType1(inputType: any) {
    this.inputType1 = inputType;
  }
onStatusChange(): void {
  this.status = this.userForm.get('status')?.value;
}
onFirstNameChange(event: any): void {
      let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, ''); 
    inputValue = inputValue.replace(/[^a-zA-Z'\- ]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.userForm.get('first_name')?.setValue(inputValue, { emitEvent: false });
}
onLastNameChange(event: any): void {
        let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, ''); 
    inputValue = inputValue.replace(/[^a-zA-Z'\- ]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.userForm.get('last_name')?.setValue(inputValue, { emitEvent: false });
}
 getRole() {
    this._identitySer.getRole().subscribe({
      next: (data: any) => {
        this.role = data.data.role_names;
      },
    });
  }
  getDepNames(){
    this._orgSer.getDepNames().subscribe({
      next: (data: any) => {
       this.department = data.data
      },
    })
  }
onCancel()
{
  this.router.navigate(['/identity/users'])

}
getUserDetails(){
    this._identitySer.getUserById(this.userId).subscribe({
      next: (data: any) => {
        if (data) {
          const userData = data.data.data;
          const statusValue = userData.status==='active'? true :false;
          this.userForm.patchValue({
          ...userData,
          status: statusValue,
          });
        }
      },
    });
}
updateUser(){
  if (this.userForm.invalid) {
      this._healthnableCoreService.apiWarning('Kindly enter valid information');
    } 
    else {
      const formValue = { ...this.userForm.value };
      formValue.first_name = formValue.first_name || ''
      formValue.last_name = formValue.last_name || '';
      formValue.email=formValue.email || '',
      formValue.department=formValue.department || '',
      formValue.roles= formValue.roles || ''
      formValue.status = formValue.status ? 'active' : 'inactive';

      this._identitySer.updateUser(this.userId, formValue)
        .subscribe({
          next: (data: any) => {
            this._healthnableCoreService.apiSuccess(data.data.message);
             this.router.navigate(['/identity/users'])
          },
        });
    }
}
}


