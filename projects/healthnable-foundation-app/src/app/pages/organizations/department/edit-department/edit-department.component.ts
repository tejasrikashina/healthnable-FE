import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CountryISO, NgxIntlTelInputModule, SearchCountryField } from 'ngx-intl-tel-input';
import { CalendarComponent } from '../../../../core-components/calendar/calendar.component';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { Router } from '@angular/router';
import { OrganizationService } from '../../../../services/organization.service';

@Component({
  selector: 'app-edit-department',
  standalone: true,
  imports: [MaterialModule,HeaderComponent,TranslateModule,InputComponent,PrimeNGModule,
    SelectComponent,TextAreaComponent,StatusComponent,ReactiveFormsModule,NgxIntlTelInputModule,],
  templateUrl: './edit-department.component.html',
  styleUrl: './edit-department.component.scss'
})
export class EditDepartmentComponent {
  constructor(private fb:FormBuilder, private router:Router,private _orgService:OrganizationService){}
  depForm!: FormGroup;
  status!: boolean;
  preferredCountries: CountryISO[] = [CountryISO.India];
  SearchCountryField = SearchCountryField;
  selectedCountryISO: CountryISO = CountryISO.India;
  CountryISO = CountryISO;
  hodValue!: any[];
  parentDepValue!:any[]
  associatedLoc!:any[]
  depType!:any[]
  associatedOrg!:any[]
ngOnInit() {
   this.getAllhods()
    this.getParentDep()
    this.getAssociatedLoc()
    this.getDepType()
    this.getAssociatedOrg()
    this.depForm = this.fb.group({
      department_name: ['', [Validators.required]],
      type_of_department: ['', [Validators.required]],
      associated_organizations: ['', [Validators.required]],
      associated_facilities: ['', [Validators.required]],
      parent_department: ['',[Validators.required]],
      hod: ['', [Validators.required]],
      country_code: [''],
      contact_phone: ['', [Validators.required]],
      contact_email: ['', [Validators.required]],
      operational_hours_from: ['', Validators.required],
      operational_hours_to: ['', Validators.required],
      notes: [''],
      status: [true],
    });
}
      onCancel() {
    this.router.navigate(['/organizations/department'])
 }
   onStatusChange(): void {
    this.status = this.depForm.get('status')?.value;
  }
 getAllhods(){
    this._orgService.getDepHods().subscribe({
      next:(data:any)=>{
  this.hodValue = data.data
      }
    })
  }
  getParentDep(){
        this._orgService.getParentDepartment().subscribe({
      next:(data:any)=>{
  this.parentDepValue = data.data
      
      }
    })
  }
  getAssociatedLoc(){
    this._orgService.getAssociatedLoc().subscribe({
      next:(data:any)=>{
        this.associatedLoc=data.data
      }
    })
  }
  getDepType(){
    this._orgService.getDepType().subscribe({
      next:(data:any)=>{
        this.depType=data.data
      }
    })
  }
  getAssociatedOrg(){
        this._orgService.getAssociatedOrg().subscribe({
      next:(data:any)=>{
        this.associatedOrg=data.data
      }
    })
  }
}
