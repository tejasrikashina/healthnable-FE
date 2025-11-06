import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  CountryISO,
  NgxIntlTelInputModule,
  SearchCountryField,
} from 'ngx-intl-tel-input';
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
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
interface PhoneModel {
  number: any;
  internationalNumber: any;
  nationalNumber: any;
  e164Number: any;
  countryCode: any;
  dialCode: any;
}
@Component({
  selector: 'app-add-department',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderComponent,
    TranslateModule,
    InputComponent,
    PrimeNGModule,
    SelectComponent,
    TextAreaComponent,
    StatusComponent,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
  ],
  templateUrl: './add-department.component.html',
  styleUrl: './add-department.component.scss',
})
export class AddDepartmentComponent implements OnInit {
  constructor(private fb: FormBuilder, private router: Router, private _orgService:OrganizationService,private _healtnableCoreService: HealthnableCoreService) {}
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
    this.router.navigate(['/organizations/department']);
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
  addDepartment(){
 if (this.depForm.valid) {
      const phoneDetails: PhoneModel =
        this.depForm.get('contact_phone')?.value;
      const formData = new FormData();
      formData.append(
        'department_name',
        this.depForm.get('department_name')?.value || ''
      );
      formData.append(
        'type_of_department',
        this.depForm.get('type_of_department')?.value || ''
      );
      formData.append(
        'associated_organizations',
        this.depForm.get('associated_organizations')?.value || ''
      );
      formData.append(
        'associated_facilities',
        this.depForm.get('associated_facilities')?.value || ''
      );
       formData.append(
        'status',
        this.depForm.get('status')?.value ? 'Active' : 'Inactive'
      );
      formData.append(
        'parent_department',
        this.depForm.get('parent_department')?.value || ''
      );
       formData.append(
        'hod',
        this.depForm.get('hod')?.value || ''
      );
       formData.append(
        'contact_email',
        this.depForm.get('contact_email')?.value || ''
      );
     
      formData.append(
        'contact_phone',
        phoneDetails?.number?.replace(/\s+/g, '') || ''
      );
    
      formData.append('country_code', phoneDetails?.dialCode || '');
     
     
     
      formData.append(
        'notes',
        this.depForm.get('notes')?.value || ''
      );
      const fromTime = this.depForm.get('operational_hours_from')?.value;
      const toTime = this.depForm.get('operational_hours_to')?.value;

      const formatTime = (date: Date): string => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h = hours % 12 || 12;
        const m =
          minutes === 0 ? '00' : minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${h}.${m}${ampm}`;
      };

      const operationalHours=`From ${formatTime(
        new Date(fromTime))} to ${formatTime(new Date(toTime))}`

      formData.append('operational_hours', operationalHours);

      const logoFile = this.depForm.get('logo')?.value;
      if (logoFile instanceof File) {
        formData.append('logo', logoFile);
      }
      const faviconFile = this.depForm.get('favicon')?.value;
      if (faviconFile instanceof File) {
        formData.append('favicon', faviconFile);
      }
      this._orgService.addDepartment(formData).subscribe({
        next: (data: any) => {
          this.depForm.reset();
          this._healtnableCoreService.apiSuccess(
            `${data.data.department_code} - ${data.message}`
          );
          this.router.navigate(['/organizations/department']);
        },
      });
    }
  }
  addDepartmentNew(){
     if (this.depForm.valid) {
      const phoneDetails: PhoneModel =
        this.depForm.get('contact_phone')?.value;
      const formData = new FormData();
      formData.append(
        'department_name',
        this.depForm.get('department_name')?.value || ''
      );
      formData.append(
        'type_of_department',
        this.depForm.get('type_of_department')?.value || ''
      );
      formData.append(
        'associated_organizations',
        this.depForm.get('associated_organizations')?.value || ''
      );
      formData.append(
        'associated_facilities',
        this.depForm.get('associated_facilities')?.value || ''
      );
       formData.append(
        'status',
        this.depForm.get('status')?.value ? 'Active' : 'Inactive'
      );
      formData.append(
        'parent_department',
        this.depForm.get('parent_department')?.value || ''
      );
       formData.append(
        'hod',
        this.depForm.get('hod')?.value || ''
      );
       formData.append(
        'contact_email',
        this.depForm.get('contact_email')?.value || ''
      );
     
      formData.append(
        'contact_phone',
        phoneDetails?.number?.replace(/\s+/g, '') || ''
      );
    
      formData.append('country_code', phoneDetails?.dialCode || '');
     
     
     
      formData.append(
        'notes',
        this.depForm.get('notes')?.value || ''
      );
      const fromTime = this.depForm.get('operational_hours_from')?.value;
      const toTime = this.depForm.get('operational_hours_to')?.value;

      const formatTime = (date: Date): string => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h = hours % 12 || 12;
        const m =
          minutes === 0 ? '00' : minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${h}.${m}${ampm}`;
      };

      const operationalHours=`From ${formatTime(
        new Date(fromTime))} to ${formatTime(new Date(toTime))}`

      formData.append('operational_hours', operationalHours);

      const logoFile = this.depForm.get('logo')?.value;
      if (logoFile instanceof File) {
        formData.append('logo', logoFile);
      }
      const faviconFile = this.depForm.get('favicon')?.value;
      if (faviconFile instanceof File) {
        formData.append('favicon', faviconFile);
      }
      this._orgService.addDepartment(formData).subscribe({
        next: (data: any) => {
          this.depForm.reset();
          this._healtnableCoreService.apiSuccess(
            `${data.data.department_code} - ${data.message}`
          );
          this.depForm.reset({
          status: true
        });
  
          this.router.navigate(['organizations/organization/add-department']);
        },
      });
         
   
    }
  }
  onStatusChange(): void {
    this.status = this.depForm.get('status')?.value;
  }
}
