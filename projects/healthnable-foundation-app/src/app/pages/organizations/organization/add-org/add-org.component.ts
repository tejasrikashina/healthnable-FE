import { Component, HostListener, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CountryISO,
  NgxIntlTelInputModule,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { OrganizationService } from '../../../../services/organization.service';
import { SelectFileComponent } from '../../../../core-components/select-file/select-file.component';
import { OnlyNumbersDirective } from '../../../../directives/only-numbers.directive';
import { TaxIdDirective } from '../../../../directives/tax-id.directive';
import { PincodeDirective } from '../../../../directives/pincode.directive';
interface PhoneModel {
  number: any;
  internationalNumber: any;
  nationalNumber: any;
  e164Number: any;
  countryCode: any;
  dialCode: any;
}

@Component({
  selector: 'app-add-org',
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
    SelectFileComponent,
    OnlyNumbersDirective,
    TaxIdDirective,
    PincodeDirective,
  ],
  templateUrl: './add-org.component.html',
  styleUrl: './add-org.component.scss',
})
export class AddOrgComponent implements OnInit {
  constructor(
    private _healtnableCoreService: HealthnableCoreService,
    private fb: FormBuilder,
    private _orgService: OrganizationService,
    private messageService: MessageService,
    private router: Router
  ) {}
  orgForm!: FormGroup;
  languageValue!: any[];
  orgType!: any[];
  countryValue!: any[];
  stateValue!: any[];
  cityValue!: any[];
  timezoneValue!: any[];
  preferredCountries: CountryISO[] = [CountryISO.India];
  SearchCountryField = SearchCountryField;
  selectedCountryISO: CountryISO = CountryISO.India;
  CountryISO = CountryISO;
  status!: boolean;
  locationValue = [
    { name: 'Notification' },
    { name: 'Form' },
    { name: 'Survey' },
    { name: 'Consent' },
    { name: 'Document' },
    { name: 'Task' },
    { name: 'Campaign' },
  ];
  ngOnInit() {
    this.orgForm = this.fb.group({
      // code:['',[Validators.required]],
      organization_name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(70),
          Validators.pattern(this._healtnableCoreService.regEx.specialName),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(this._healtnableCoreService.regEx.email),
        ],
      ],
      phone: ['', [Validators.required]],
      tax_id: [
        '',
        [
          
          Validators.pattern(this._healtnableCoreService.regEx.taxId),
        ],
      ],

      npi: [
        '',
        [
         
          Validators.pattern(this._healtnableCoreService.regEx.number),
        ],
      ],
      zipcode: [
       { value: '', disabled: true },
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(10),
          Validators.pattern(/^(?!.*-.*-)[0-9\-]{5,10}$/),
        ],
      ],
      country_code: [''],
      country: ['', Validators.required],
      state: [{ value: '', disabled: true }, [Validators.required]],
      city: [{ value: '', disabled: true }, [Validators.required]],
      address_line1: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(250),
        ],
      ],
      address_line2: ['', [ Validators.minLength(5),
          Validators.maxLength(250)]],
      timezone:[{ value: '', disabled: true }, Validators.required],
        default_language: ['', [Validators.required]],
        
      primary_contact: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(70),
        ],
      ],
     
    
      website: [''],
      organization_type: ['', [Validators.required]],
      status: [true],
      description: ['', [Validators.maxLength(1000)]],
      logo: [''],
      favicon: [''],
    });
    this.getOrganizationType();
    this.getLangValue();
    this.getCountryValue();
    this.orgForm.get('country')?.valueChanges.subscribe((selectedCountry) => {
      if (selectedCountry && selectedCountry.code) {
      const stateName = this.orgForm.get('state')

        this._orgService.getStates(selectedCountry.code).subscribe({
          next: (data: any) => {
            if (data && data.length > 0) {
            stateName?.enable(); 
             this.stateValue = data;
          } else {
            stateName?.disable();
          }
          },
        });
      } else {
        this.stateValue = [];
      }
    });
    this.orgForm.get('state')?.valueChanges.subscribe((selectedState) => {
      const selectedCountry = this.orgForm.get('country')?.value;
      const cityName = this.orgForm.get('city')

      if (selectedCountry?.code && selectedState.code) {
        this._orgService
          .getCities(selectedCountry.code, selectedState.code)
          .subscribe({
            next: (data: any) => {
                if (data && data.length > 0) {
            cityName?.enable(); 
             this.cityValue = data;
          } else {
            cityName?.disable();
          }
            },
          });
      } else {
        this.cityValue = [];
      cityName?.disable(); 

      }
    });
    this.orgForm.get('country')?.valueChanges.subscribe((selectedCountry) => {
      const timezoneControl = this.orgForm.get('timezone');
      if (selectedCountry && selectedCountry.code) {
        this._orgService.getTimeZone(selectedCountry.code).subscribe({
          next: (data: any) => {
           if (data && data.length > 0) {
            timezoneControl?.enable(); 
             this.timezoneValue = data;
          } else {
            timezoneControl?.disable();
          }
        }
      });
    } else {
      this.timezoneValue = [];
      timezoneControl?.disable(); 
    }
    });
    
  this.orgForm.get('city')?.valueChanges.subscribe((selectedCity) => {
  const zipcodeControl = this.orgForm.get('zipcode');
  if (selectedCity && selectedCity.name) {
    zipcodeControl?.enable();
  } else {
    zipcodeControl?.disable();
    zipcodeControl?.reset();  
  }
});

  }
 
  onCancel() {
    this.router.navigate(['organizations/organization']);
  }
  onStatusChange(): void {
    this.status = this.orgForm.get('status')?.value;
  }

 addOrg() {
  if (this.orgForm.valid) {
    const phoneDetails: PhoneModel = this.orgForm.get('phone')?.value;
    const formData = new FormData();
    formData.append('organization_name', this.orgForm.get('organization_name')?.value || '');
    formData.append('organization_type', this.orgForm.get('organization_type')?.value?.organization_type_name || '');
    formData.append('npi', this.orgForm.get('npi')?.value || '');
    formData.append('phone', phoneDetails?.number?.replace(/\s+/g, '') || '');
    formData.append('tax_id', this.orgForm.get('tax_id')?.value || '');
    formData.append('email', this.orgForm.get('email')?.value || '');
    formData.append('website', this.orgForm.get('website')?.value || '');
    formData.append('primary_contact', this.orgForm.get('primary_contact')?.value || '');
    formData.append('description', this.orgForm.get('description')?.value || '');
    formData.append('country_code', phoneDetails?.dialCode || '');
    formData.append('country', this.orgForm.get('country')?.value?.name || '');
    formData.append('state', this.orgForm.get('state')?.value?.name || '');
    formData.append('city', this.orgForm.get('city')?.value?.name || '');
    formData.append('zipcode', this.orgForm.get('zipcode')?.value || '');
    formData.append('address_line1', this.orgForm.get('address_line1')?.value || '');
    formData.append('address_line2', this.orgForm.get('address_line2')?.value || '');
    formData.append('timezone', this.orgForm.get('timezone')?.value?.name || '');
    formData.append('default_language', this.orgForm.get('default_language')?.value?.name || '');
    formData.append('status', this.orgForm.get('status')?.value ? 'Active' : 'Inactive');
    const logoFile = this.orgForm.get('logo_path')?.value;
    if (logoFile instanceof File) {
      formData.append('logo', logoFile);
    }
    const faviconFile = this.orgForm.get('favicon_path')?.value;
    if (faviconFile instanceof File) {
      formData.append('favicon', faviconFile);
    }
    this._orgService.addOrg(formData).subscribe({
      next: (data: any) => {
        this.orgForm.reset();
        this._healtnableCoreService.apiSuccess(`${data.data.organization_code} - ${data.message}`);
        this.router.navigate(['/organizations/organization']);
      },
    });
  }
}


  addNewOrg() {
     if (this.orgForm.valid) {
    const phoneDetails: PhoneModel = this.orgForm.get('phone')?.value;

    const formData = new FormData();

    formData.append('organization_name', this.orgForm.get('organization_name')?.value || '');
    formData.append('organization_type', this.orgForm.get('organization_type')?.value?.organization_type_name || '');
    formData.append('npi', this.orgForm.get('npi')?.value || '');
    formData.append('phone', phoneDetails?.number?.replace(/\s+/g, '') || '');
    formData.append('tax_id', this.orgForm.get('tax_id')?.value || '');
    formData.append('email', this.orgForm.get('email')?.value || '');
    formData.append('website', this.orgForm.get('website')?.value || '');
    formData.append('primary_contact', this.orgForm.get('primary_contact')?.value || '');
    formData.append('description', this.orgForm.get('description')?.value || '');

    formData.append('country_code', phoneDetails?.dialCode || '');
    formData.append('country', this.orgForm.get('country')?.value?.name || '');
    formData.append('state', this.orgForm.get('state')?.value?.name || '');
    formData.append('city', this.orgForm.get('city')?.value?.name || '');
    formData.append('zipcode', this.orgForm.get('zipcode')?.value || '');
    formData.append('address_line1', this.orgForm.get('address_line1')?.value || '');
    formData.append('address_line2', this.orgForm.get('address_line2')?.value || '');
    formData.append('timezone', this.orgForm.get('timezone')?.value?.name || '');
    formData.append('default_language', this.orgForm.get('default_language')?.value?.name || '');
    formData.append('status', this.orgForm.get('status')?.value ? 'Active' : 'Inactive');

    const logoFile = this.orgForm.get('logo_path')?.value;
    if (logoFile instanceof File) {
      formData.append('logo', logoFile);
    }

    const faviconFile = this.orgForm.get('favicon_path')?.value;
    if (faviconFile instanceof File) {
      formData.append('favicon', faviconFile);
    }

    this._orgService.addOrg(formData).subscribe({
      next: (data: any) => {
        this.orgForm.reset();
        this._healtnableCoreService.apiSuccess(`${data.data.organization_code} - ${data.message}`);
          this.orgForm.reset({
          status: true
        });
        this.router.navigate(['/organizations/organization/add-organization']);
      },
     
    });
  }
  }
  onOrgNameChange(event: any) {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, '');
     inputValue = inputValue.replace(/[^A-Za-z0-9.,&'\/()\-\s]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.orgForm
      .get('organization_name')
      ?.setValue(inputValue, { emitEvent: false });
  }
  onPriContChange(event: any) {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, '');
    inputValue = inputValue.replace(/[^a-zA-Z'\- ]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.orgForm
      .get('primary_contact')
      ?.setValue(inputValue, { emitEvent: false });
  }
  get f() {
    return this.orgForm.controls;
  }
  @HostListener('document:keydown.enter', ['$event'])
handleEnter(event: KeyboardEvent) {
  if ((event.target as HTMLElement).closest('ngx-intl-tel-input')) {
    event.preventDefault();
  }
}
  getCountryValue() {
    this._orgService.getCountries().subscribe({
      next: (data: any) => {
        this.countryValue = data;
      },
    });
  }
  getOrganizationType() {
    this._orgService.getOrgType().subscribe({
      next: (data: any) => {
        this.orgType = data.data;
      },
    });
  }
  getLangValue() {
    this._orgService.getLanguages().subscribe({
      next: (data: any) => {
        this.languageValue = data;
      },
    });
  }
}
