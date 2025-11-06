import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { ViewChild } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { SelectFileComponent } from '../../../../core-components/select-file/select-file.component';
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
  selector: 'app-edit-facility',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderComponent,
    TranslateModule,
    InputComponent,
    PrimeNGModule,
    SelectFileComponent,
    SelectComponent,
    TextAreaComponent,
    StatusComponent,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
  ],
  templateUrl: './edit-facility.component.html',
  styleUrl: './edit-facility.component.scss',
})
export class EditFacilityComponent {
  facCode: any;
  constructor(
    private fb: FormBuilder,
    private _orgService: OrganizationService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    private _healthnableCoreService: HealthnableCoreService
  ) {
    this.activatedRoute.params.subscribe((param: any) => {
      this.facCode = param['facilityCode'];
      this.getFacDetails();
    });
  }
  facilityForm!: FormGroup;
  status!: boolean;
  languageValue!: any[];
  countryValue!: any[];
  stateValue!: any[];
  cityValue!: any[];
  facility!: any[];
  assOrg!: any[];
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
  @ViewChild('startCalendar') startCalendar!: any;
  @ViewChild('endCalendar') endCalendar!: any;

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
          Validators.pattern(this._healthnableCoreService.regEx.specialName),
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
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
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
        [
          
          Validators.pattern(this._healthnableCoreService.regEx.faxNumber),
        ],
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
          Validators.pattern(this._healthnableCoreService.regEx.email),
        ],
      ],
      default_language: ['', [Validators.required]],
      status: [true],
      description: ['', [Validators.maxLength(1000)]],
      npi_number: [
        '',
        [
         
          Validators.pattern(this._healthnableCoreService.regEx.number),
        ],
      ],
      tax_id: [
        '',
        [
       
          Validators.pattern(this._healthnableCoreService.regEx.taxId),
        ],
      ],
      operational_hours_from: ['', Validators.required],
      operational_hours_to: ['', Validators.required],
      logo: [''],
      favicon: [''],
    });
    forkJoin({
      languages: this._orgService.getLanguages(),
      // orgTypes: this._orgService.getOrgType(),
      countries: this._orgService.getCountries(),
    }).subscribe({
      next: ({ languages, countries }) => {
        this.languageValue = languages;
        this.countryValue = countries;

        this.getFacDetails();
      },
      error: (err) => {
        console.error('Error loading form data', err);
      },
    });
    this.getLangValue();
    this.getCountryValue();
    this.facilityForm
      .get('country')
      ?.valueChanges.subscribe((selectedCountry) => {
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
    this.facilityForm.get('state')?.valueChanges.subscribe((selectedState) => {
      const selectedCountry = this.facilityForm.get('country')?.value;
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
  getFacDetails() {
    this._orgService.getFacByCode(this.facCode).subscribe({
      next: (res: any) => {
        if (res?.data) {
          const facData = res.data;
          const selectedLang = this.languageValue.find(
            (lan: any) => lan.name === facData.default_language
          );
          const selectedCountry = this.countryValue.find(
            (country: any) => country.name === facData.country
          );
          this._orgService.getStates(selectedCountry.code).subscribe({
            next: (states: any) => {
              this.stateValue = states;
              const selectedState = this.stateValue.find(
                (state: any) =>
                  state.name.toLowerCase() === facData.state.toLowerCase()
              );

              this._orgService
                .getCities(selectedCountry.code, selectedState?.code)
                .subscribe({
                  next: (cities: any) => {
                    this.cityValue = cities;
                    const selectedCity = this.cityValue.find(
                      (c: any) => c.name === facData.city
                    );
                    this._orgService
                      .getTimeZone(selectedCountry.code)
                      .subscribe({
                        next: (timezones: any) => {
                          this.timezoneValue = timezones;
                          const selectedTimezone = timezones.find(
                            (tz: any) => tz.name === facData.timezone
                          );
                            const statusValue = facData.status.toLowerCase()==='active'? true :false;
                       const parsedHours = this.parseOperationalHoursToDates(facData.operational_hours);
                          this.facilityForm.patchValue({
                            facility_name: facData.facility_name || '',
                            facility_type: facData.facility_type || '',
                            associated_organizations:
                              facData.associated_organizations || '',
                            address_line1: facData.address_line1 || '',
                            address_line2: facData.address_line2 || '',
                            country: selectedCountry || '',
                             state: selectedState || '',
                               city: selectedCity || '',
                            zipcode: facData.zipcode || '',
                            phone_number: facData.phone_number || '',
                            fax_number: facData.fax_number || '',
                            timezone: selectedTimezone || '',
                            primary_contact: facData.primary_contact || '',
                            contact_email: facData.contact_email || '',
                            default_language: selectedLang || '',
                            status: statusValue,
                            description: facData.description || '',
                            npi_number: facData.npi_number || '',
                            tax_id: facData.tax_id || '',
                            operational_hours_from: parsedHours?.from || '',
                            operational_hours_to: parsedHours?.to || '',
                            logo_path: facData.logo_path || '',
                            favicon_path: facData.favicon_path || '',
                          });
                        },
                      });
                  },
                });
            },
          });
        }
      },
     
    });
  }

parseOperationalHoursToDates(hours: string): { from: Date; to: Date } | null {
  if (!hours) return null;

  const parts = hours.split('-');
  if (parts.length !== 4) return null;

  const fromDayStr = parts[0]; // MON
  const toDayStr = parts[1];   // FRI
  const fromTimeStr = parts[2]; // 2.58PM
  const toTimeStr = parts[3];   // 6.00PM

  const fromDate = this.convertDayTimeToDate(fromDayStr, fromTimeStr);
  const toDate = this.convertDayTimeToDate(toDayStr, toTimeStr);

  return { from: fromDate, to: toDate };
}
convertDayTimeToDate(day: string, timeStr: string): Date {
  const dayMap: { [key: string]: number } = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
  };

  const today = new Date();
  const baseDate = new Date(today);
  const todayDay = today.getDay();
  const targetDay = dayMap[day.toUpperCase()] ?? 0;

  const dayDiff = (targetDay + 7 - todayDay) % 7;
  baseDate.setDate(today.getDate() + dayDiff);

  const match = timeStr.match(/(\d{1,2})\.(\d{2})(AM|PM)/i);
  if (!match) return baseDate;
let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  baseDate.setHours(hours, minutes, 0, 0);
  return baseDate;
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
  updateFacility(){
    if (this.facilityForm.invalid) {
    this._healthnableCoreService.apiWarning('Kindly enter valid information');
    return;
  }
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
        formData.append('logo', logoFile);
      }
      const faviconFile = this.facilityForm.get('favicon')?.value;
      if (faviconFile instanceof File) {
        formData.append('favicon', faviconFile);
      }
       this._orgService.updateFacility(this.facCode, formData).subscribe({
        next: (data: any) => {
          this.facilityForm.reset();
          this._healthnableCoreService.apiSuccess(
            `${data.data.facility_code} - ${data.message}`
          );
          this.router.navigate(['/organizations/facility']);
        },
      });
  }
}
