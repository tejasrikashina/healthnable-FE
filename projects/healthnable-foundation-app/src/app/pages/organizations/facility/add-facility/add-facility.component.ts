import { Component } from '@angular/core';
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
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { SelectFileComponent } from '../../../../core-components/select-file/select-file.component';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { OnlyNumbersDirective } from '../../../../directives/only-numbers.directive';
import { TaxIdDirective } from '../../../../directives/tax-id.directive';
import { FaxNumberDirective } from '../../../../directives/fax-number.directive';
import { OrganizationService } from '../../../../services/organization.service';
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
  selector: 'healthnable-add-facility',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderComponent,
    TranslateModule,
    InputComponent,
    PrimeNGModule,
    OnlyNumbersDirective,
    TaxIdDirective,
    FaxNumberDirective,
    PincodeDirective,
    SelectComponent,
    TextAreaComponent,
    StatusComponent,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    SelectFileComponent,
  ],
  templateUrl: './add-facility.component.html',
  styleUrl: './add-facility.component.scss',
})
export class AddFacilityComponent {
  constructor(
    private fb: FormBuilder,
    private _orgService: OrganizationService,
    private messageService: MessageService,
    private router: Router,
    private _healtnableCoreService: HealthnableCoreService
  ) {}
  facilityForm!: FormGroup;
  status!: boolean;
  facility!: any[];
  assOrg!: any[];

  countryValue!: any[];
  stateValue!: any[];
  cityValue!: any[];
  languageValue!: any[];
  timezoneValue!: any[];
  preferredCountries: CountryISO[] = [CountryISO.India];
  SearchCountryField = SearchCountryField;
  selectedCountryISO: CountryISO = CountryISO.India;
  CountryISO = CountryISO;
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
    this.getFacilityType();
    this.getAssOrg();
    this.facilityForm = this.fb.group({
      facility_name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(70),
          Validators.pattern(this._healtnableCoreService.regEx.specialName),
        ],
      ],
      facility_type: ['', [Validators.required]],
      associated_organizations: ['', [Validators.required]],
      address_line1: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(250),
        ],
      ],
      address_line2: ['', [Validators.minLength(5), Validators.maxLength(250)]],
      city: [{ value: '', disabled: true }, [Validators.required]],
      state: [{ value: '', disabled: true }, [Validators.required]],
      country: ['', Validators.required],
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
      phone_number: ['', [Validators.required]],
      fax_number: [
        '',
        [Validators.pattern(this._healtnableCoreService.regEx.faxNumber)],
      ],
      timezone: [{ value: '', disabled: true }, Validators.required],

      primary_contact: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(70),
        ],
      ],
      contact_email: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(this._healtnableCoreService.regEx.email),
        ],
      ],
      default_language: ['', [Validators.required]],
      status: [true],
      description: ['', [Validators.maxLength(1000)]],
      npi_number: [
        '',
        [Validators.pattern(this._healtnableCoreService.regEx.number)],
      ],
      tax_id: [
        '',
        [Validators.pattern(this._healtnableCoreService.regEx.taxId)],
      ],
      operational_hours_from: ['', Validators.required],
      operational_hours_to: ['', Validators.required],
      logo: [''],
      favicon: [''],
    });
    this.getLangValue();
    this.getCountryValue();
    this.facilityForm
      .get('country')
      ?.valueChanges.subscribe((selectedCountry) => {
        if (selectedCountry && selectedCountry.code) {
          const stateName = this.facilityForm.get('state');
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
    this.facilityForm.get('state')?.valueChanges.subscribe((selectedState) => {
      const selectedCountry = this.facilityForm.get('country')?.value;
      const cityName = this.facilityForm.get('city');
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
    this.facilityForm
      .get('country')
      ?.valueChanges.subscribe((selectedCountry) => {
        const timezoneControl = this.facilityForm.get('timezone');
        if (selectedCountry && selectedCountry.code) {
          this._orgService.getTimeZone(selectedCountry.code).subscribe({
            next: (data: any) => {
              if (data && data.length > 0) {
                timezoneControl?.enable();
                this.timezoneValue = data;
              } else {
                timezoneControl?.disable();
              }
            },
          });
        } else {
          this.timezoneValue = [];
          timezoneControl?.disable();
        }
      });
  }
  get f() {
    return this.facilityForm.controls;
  }
  onStatusChange(): void {
    this.status = this.facilityForm.get('status')?.value;
  }
  getOrgNames() {
    this._orgService.getOrgNames().subscribe({
      next: (data: any) => {},
    });
  }
  getFacilityType() {
    this._orgService.getFacilityType().subscribe({
      next: (data: any) => {
        this.facility = data.data.facility_types;
      },
    });
  }
  getAssOrg() {
    this._orgService.getAssOrg().subscribe({
      next: (data: any) => {
        this.assOrg = data.data.associated_organizations;
      },
    });
  }
  getCountryValue() {
    this._orgService.getCountries().subscribe({
      next: (data: any) => {
        this.countryValue = data;
      },
    });
  }
  onCancel() {
    this.router.navigate(['/organizations/facility']);
  }
  getLangValue() {
    this._orgService.getLanguages().subscribe({
      next: (data: any) => {
        this.languageValue = data;
      },
    });
  }
  onfacNameChange(event: any) {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, '');
     inputValue = inputValue.replace(/[^A-Za-z0-9.,&'\/()\-\s]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.facilityForm
      .get('facility_name')
      ?.setValue(inputValue, { emitEvent: false });
  }
  onPriContChange(event: any) {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, '');
    inputValue = inputValue.replace(/[^a-zA-Z'\- ]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.facilityForm
      .get('primary_contact')
      ?.setValue(inputValue, { emitEvent: false });
  }
  addFacility() {
    if (this.facilityForm.valid) {
      const phoneDetails: PhoneModel =
        this.facilityForm.get('phone_number')?.value;
      const formData = new FormData();
      formData.append(
        'facility_name',
        this.facilityForm.get('facility_name')?.value || ''
      );
      formData.append(
        'facility_type',
        this.facilityForm.get('facility_type')?.value || ''
      );
      formData.append(
        'associated_organizations',
        this.facilityForm.get('associated_organizations')?.value || ''
      );
      formData.append(
        'address_line1',
        this.facilityForm.get('address_line1')?.value || ''
      );
      formData.append(
        'address_line2',
        this.facilityForm.get('address_line2')?.value || ''
      );
      formData.append('city', this.facilityForm.get('city')?.value?.name || '');
      formData.append(
        'state',
        this.facilityForm.get('state')?.value?.name || ''
      );
      formData.append(
        'country',
        this.facilityForm.get('country')?.value?.name || ''
      );
      formData.append('zipcode', this.facilityForm.get('zipcode')?.value || '');
      formData.append('country_code', phoneDetails?.dialCode || '');
      formData.append(
        'phone_number',
        phoneDetails?.number?.replace(/\s+/g, '') || ''
      );
      formData.append(
        'fax_number',
        this.facilityForm.get('fax_number')?.value || ''
      );
      formData.append(
        'timezone',
        this.facilityForm.get('timezone')?.value?.name || ''
      );
      formData.append(
        'primary_contact',
        this.facilityForm.get('primary_contact')?.value || ''
      );
      formData.append(
        'contact_email',
        this.facilityForm.get('contact_email')?.value || ''
      );
      formData.append(
        'default_language',
        this.facilityForm.get('default_language')?.value?.name || ''
      );
      formData.append(
        'status',
        this.facilityForm.get('status')?.value ? 'Active' : 'Inactive'
      );
      formData.append(
        'description',
        this.facilityForm.get('description')?.value || ''
      );
      formData.append(
        'npi_number',
        this.facilityForm.get('npi_number')?.value || ''
      );

      formData.append('tax_id', this.facilityForm.get('tax_id')?.value || '');
      const fromTime = this.facilityForm.get('operational_hours_from')?.value;
      const toTime = this.facilityForm.get('operational_hours_to')?.value;
      const fromDate = new Date(fromTime);
      const toDate = new Date(toTime);
      const fromDay = fromDate
        .toLocaleString('en-US', { weekday: 'short' })
        .toUpperCase();
      const toDay = toDate
        .toLocaleString('en-US', { weekday: 'short' })
        .toUpperCase();
      const formatTime = (date: Date): string => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h = hours % 12 || 12;
        const m =
          minutes === 0 ? '00' : minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${h}.${m}${ampm}`;
      };

      const operationalHours = `${fromDay}-${toDay}-${formatTime(
        new Date(fromTime)
      )}-${formatTime(new Date(toTime))}`;

      formData.append('operational_hours', operationalHours);

      const logoFile = this.facilityForm.get('logo')?.value;
     if (logoFile instanceof File) {
  const logoString = `@${logoFile.name};type=${logoFile.type}`;
  formData.append('logo', logoString);
}
      const faviconFile = this.facilityForm.get('favicon')?.value;
      if (faviconFile instanceof File) {
  const faviconString = `@${faviconFile.name};type=${faviconFile.type}`;
  formData.append('favicon', faviconString);
}
      this._orgService.addFacility(formData).subscribe({
        next: (data: any) => {
          this.facilityForm.reset();
          this._healtnableCoreService.apiSuccess(
            `${data.data.facility_code} - ${data.message}`
          );
          this.router.navigate(['/organizations/facility']);
        },
      });
    }
  }
  addNewFacility() {
    if (this.facilityForm.valid) {
      const phoneDetails: PhoneModel =
        this.facilityForm.get('phone_number')?.value;
      const formData = new FormData();
      formData.append(
        'facility_name',
        this.facilityForm.get('facility_name')?.value || ''
      );
      formData.append(
        'facility_type',
        this.facilityForm.get('facility_type')?.value || ''
      );
      formData.append(
        'associated_organizations',
        this.facilityForm.get('associated_organizations')?.value || ''
      );
      formData.append(
        'address_line1',
        this.facilityForm.get('address_line1')?.value || ''
      );
      formData.append(
        'address_line2',
        this.facilityForm.get('address_line2')?.value || ''
      );
      formData.append('city', this.facilityForm.get('city')?.value?.name || '');
      formData.append(
        'state',
        this.facilityForm.get('state')?.value?.name || ''
      );
      formData.append(
        'country',
        this.facilityForm.get('country')?.value?.name || ''
      );
      formData.append('zipcode', this.facilityForm.get('zipcode')?.value || '');
      formData.append('country_code', phoneDetails?.dialCode || '');
      formData.append(
        'phone_number',
        phoneDetails?.number?.replace(/\s+/g, '') || ''
      );
      formData.append(
        'fax_number',
        this.facilityForm.get('fax_number')?.value || ''
      );
      formData.append(
        'timezone',
        this.facilityForm.get('timezone')?.value?.name || ''
      );
      formData.append(
        'primary_contact',
        this.facilityForm.get('primary_contact')?.value || ''
      );
      formData.append(
        'contact_email',
        this.facilityForm.get('contact_email')?.value || ''
      );
      formData.append(
        'default_language',
        this.facilityForm.get('default_language')?.value?.name || ''
      );
      formData.append(
        'status',
        this.facilityForm.get('status')?.value ? 'Active' : 'Inactive'
      );
      formData.append(
        'description',
        this.facilityForm.get('description')?.value || ''
      );
      formData.append(
        'npi_number',
        this.facilityForm.get('npi_number')?.value || ''
      );
      formData.append('tax_id', this.facilityForm.get('tax_id')?.value || '');
      const fromTime = this.facilityForm.get('operational_hours_from')?.value;
      const toTime = this.facilityForm.get('operational_hours_to')?.value;

      const formatTime = (date: Date): string => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h = hours % 12 || 12;
        const m =
          minutes === 0 ? '00' : minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${h}.${m}${ampm}`;
      };

      const operationalHours = `MON-FRI-${formatTime(
        new Date(fromTime)
      )}-${formatTime(new Date(toTime))}`;

      formData.append('operational_hours', operationalHours);

      const logoFile = this.facilityForm.get('logo')?.value;
      if (logoFile instanceof File) {
        formData.append('logo', logoFile);
      }
      const faviconFile = this.facilityForm.get('favicon')?.value;
      if (faviconFile instanceof File) {
        formData.append('favicon', faviconFile);
      }
      this._orgService.addFacility(formData).subscribe({
        next: (data: any) => {
          this.facilityForm.reset();
          this._healtnableCoreService.apiSuccess(
            `${data.data.facility_code} - ${data.message}`
          );
          this.facilityForm.reset({
            status: true,
          });

          this.router.navigate(['organizations/organization/add-facility']);
        },
      });
    }
  }
}
