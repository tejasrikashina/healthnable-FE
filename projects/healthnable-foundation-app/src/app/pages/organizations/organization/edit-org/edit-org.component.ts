import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import {
  CountryISO,
  NgxIntlTelInputModule,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectFileComponent } from '../../../../core-components/select-file/select-file.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { OnlyNumbersDirective } from '../../../../directives/only-numbers.directive';
import { PincodeDirective } from '../../../../directives/pincode.directive';
import { TaxIdDirective } from '../../../../directives/tax-id.directive';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { OrganizationService } from '../../../../services/organization.service';
interface PhoneModel {
  number: any;
  internationalNumber: any;
  nationalNumber: any;
  e164Number: any;
  countryCode: any;
  dialCode: any;
}
@Component({
  selector: 'app-edit-org',
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
  templateUrl: './edit-org.component.html',
  styleUrl: './edit-org.component.scss',
})
export class EditOrgComponent implements OnInit {
  orgCode: any;
  constructor(
    private _healtnableCoreService: HealthnableCoreService,
    private fb: FormBuilder,
    private _healthnableCoreService:HealthnableCoreService,
    private _orgService: OrganizationService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.params.subscribe((param: any) => {
      this.orgCode = param['orgCode'];
      this.getOrgDetails();
    });
  }
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
          Validators.required,
          Validators.pattern(this._healtnableCoreService.regEx.taxId),
        ],
      ],

      npi: [
        '',
        [
          Validators.required,
          Validators.pattern(this._healtnableCoreService.regEx.number),
        ],
      ],
      zipcode: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(10),
          Validators.pattern(/^(?!.*-.*-)[0-9\-]{5,10}$/),
        ],
      ],
      country_code: [''],
      country: ['', Validators.required],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
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
      timezone: ['', Validators.required],
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
    forkJoin({
      languages: this._orgService.getLanguages(),
      orgTypes: this._orgService.getOrgType(),
      countries: this._orgService.getCountries(),
    }).subscribe({
      next: ({ languages, orgTypes, countries }) => {
        this.languageValue = languages;
        this.orgType = orgTypes.data;
        this.countryValue = countries;

        this.getOrgDetails();
      },
      error: (err) => {
        console.error('Error loading form data', err);
      },
    });
    this.getOrganizationType();
    this.getLangValue();
    this.getCountryValue();
    this.orgForm.get('country')?.valueChanges.subscribe((selectedCountry) => {
      if (selectedCountry && selectedCountry.code) {
        this._orgService.getStates(selectedCountry.code).subscribe({
          next: (data: any) => {
            this.stateValue = data;
          },
        });
      } else {
        this.stateValue = [];
      }
    });
    this.orgForm.get('state')?.valueChanges.subscribe((selectedState) => {
      const selectedCountry = this.orgForm.get('country')?.value;
      if (selectedCountry?.code && selectedState.code) {
        this._orgService
          .getCities(selectedCountry.code, selectedState.code)
          .subscribe({
            next: (data: any) => {
              this.cityValue = data;
            },
          });
      } else {
        this.cityValue = [];
      }
    });
    this.orgForm.get('country')?.valueChanges.subscribe((selectedCountry) => {
      if (selectedCountry && selectedCountry.code) {
        this._orgService.getTimeZone(selectedCountry.code).subscribe({
          next: (data: any) => {
            this.timezoneValue = data;
          },
        });
      } else {
        this.timezoneValue = [];
      }
    });
  }
  get f() {
    return this.orgForm.controls;
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
      .get('primaryContact')
      ?.setValue(inputValue, { emitEvent: false });
  }
  onStatusChange(): void {
    this.status = this.orgForm.get('status')?.value;
  }
  onCancel() {
    this.router.navigate(['organizations/organization']);
  }
getOrgDetails() {
  this._orgService.getOrgByCode(this.orgCode).subscribe({
    next: (res: any) => {
      if (res?.data) {
        const orgData = res.data;
        const selectedLang = this.languageValue.find(
          (lan: any) => lan.name === orgData.default_language
        );
        const selectedCountry = this.countryValue.find(
          (country: any) => country.name === orgData.country
        );
        const selectedOrgType = this.orgType.find(
          (type: any) => type.organization_type_name === orgData.organization_type
        );
        this._orgService.getStates(selectedCountry.code).subscribe({
          next: (states: any) => {
            this.stateValue = states;
            const selectedState = states.find((s: any) => s.name === orgData.state);

            this._orgService.getCities(selectedCountry.code, selectedState?.code).subscribe({
              next: (cities: any) => {
                this.cityValue = cities;
                const selectedCity = cities.find((c: any) => c.name === orgData.city);

                this._orgService.getTimeZone(selectedCountry.code).subscribe({
                  next: (timezones: any) => {
                    this.timezoneValue = timezones;
                    const selectedTimezone = timezones.find(
                      (tz: any) => tz.name === orgData.timezone
                    );
                     const statusValue = orgData.status==='active'? true :false;
                    this.orgForm.patchValue({
                      ...orgData,
                      country: selectedCountry,
                      state: selectedState,
                      city: selectedCity,
                      default_language: selectedLang,
                      timezone: selectedTimezone,
                      organization_type: selectedOrgType,
                      status: statusValue
                    });
                  }
                });
              }
            });
          }
        });
      }
    },
    error: (err) => {
      console.error('Error fetching organization details:', err);
    }
  });
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
 editOrg() {
  if (this.orgForm.invalid) {
    this._healthnableCoreService.apiWarning('Kindly enter valid information');
    return;
  }

  const phoneDetails: PhoneModel = this.orgForm.get('phone')?.value;
  const phone=phoneDetails.dialCode-phoneDetails.number
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

  // Handle file updates
  const logoFile = this.orgForm.get('logo')?.value;
  if (logoFile instanceof File) {
    formData.append('logo', logoFile);
  }

  const faviconFile = this.orgForm.get('favicon')?.value;
  if (faviconFile instanceof File) {
    formData.append('favicon', faviconFile);
  }

  this._orgService.updateOrg(this.orgCode, formData).subscribe({
    next: (data: any) => {
      this._healthnableCoreService.apiSuccess(data.message);
      this.router.navigate(['/organizations/organization']);
    }
  });
}

}
