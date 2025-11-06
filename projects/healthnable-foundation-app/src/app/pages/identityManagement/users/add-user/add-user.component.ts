import {  Component,CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../core-components/input/input.component';
import {CountryISO, NgxIntlTelInputModule, SearchCountryField}  from 'ngx-intl-tel-input';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { IdentityManagementService } from '../../../../services/identity-management.service';
import { OrganizationService } from '../../../../services/organization.service';
import { userData } from '../../../../type-models/identityManagement';

@Component({
  selector: 'healthnable-adduser',
  standalone: true,
  imports: [MaterialModule,SelectComponent,TranslateModule,InputComponent,ReactiveFormsModule,PrimeNGModule,NgxIntlTelInputModule,StatusComponent,HeaderComponent],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AddUserComponent implements OnInit{
  constructor(private router:Router,  private _healtnableCoreService: HealthnableCoreService,private _orgSer:OrganizationService,
    private _identitySer:IdentityManagementService){}
  role!: any[];
  department!:any[]
  fb=inject(FormBuilder)
  userForm!: FormGroup;
  status!:boolean;
  checked = false;
  disabled = false;
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
saveUser(){
 if (this.userForm.valid ){
   const rawValue = this.userForm.value;
          const transformedEntry: userData = {
            ...rawValue,
               department: rawValue.department?.name || '',
                roles: rawValue.roles || [],
             status: rawValue.status ? 'active' : 'inactive'
          }
          this._identitySer.addUser(transformedEntry).subscribe({
  next:(data:any)=>{
          this._healtnableCoreService.apiSuccess(`${data.data.data.user_id} - ${data.message}`);
            this.userForm.reset();
        this.router.navigate(['/identity/users']);
  }
})
}
}
saveNewUser(){
   if (this.userForm.valid ){
   const rawValue = this.userForm.value;
          const transformedEntry: userData = {
            ...rawValue,
               department: rawValue.department?.name || '',
                roles: rawValue.roles || [],
             status: rawValue.status ? 'active' : 'inactive'
          }
          this._identitySer.addUser(transformedEntry).subscribe({
  next:(data:any)=>{
          this._healtnableCoreService.apiSuccess(`${data.data.data.user_id} - ${data.message}`);
            this.userForm.reset({
          status: true
        });
      this.router.navigate(['/identity/users/add-user'])
  }
})
}
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


onStatusChange(): void {
  this.status = this.userForm.get('status')?.value;
}
}
