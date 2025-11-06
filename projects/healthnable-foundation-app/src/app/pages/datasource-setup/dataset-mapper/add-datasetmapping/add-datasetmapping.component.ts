import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-datasetmapping',
  standalone: true,
  imports: [MaterialModule,HeaderComponent,TranslateModule,ReactiveFormsModule,SelectComponent,InputComponent,TextAreaComponent],
  templateUrl: './add-datasetmapping.component.html',
  styleUrl: './add-datasetmapping.component.scss'
})
export class AddDatasetmappingComponent implements OnInit{
  mappingForm!:FormGroup
  dashboardValue = [
    { name: 'Outpatient Flow' },
    {name:'Inpatient Flow'},
    { name: 'Bed occupancy & availability'}  , 
     {name:'Workforce Management'},
    { name: 'Revenue Cycle & Financial'}
  ];
  metricValue=[
    { name: 'Patient Waiting > 30 mins' },
    {name:'No-Show Rate'},
    { name: 'Average Consultation Time'}  , 
    { name: 'OPD Complaints Logged Today'} 
  ];
  datasetValue = [
    { name: 'ED Dataset' },
    { name: 'ICU Tracker' },
    { name: 'OR Logs' }
  ];
  constructor(private fb:FormBuilder,private router:Router){}
  ngOnInit() {
    this.mappingForm  =this.fb.group({
      dashboard:['',[Validators.required]],
      kpi:[''],
  source: [''],
 apiEndpoint: ['', [this.apiEndpointValidator()]],
  resKey:[''],
  sampleResponse:['',[ Validators.maxLength(1000)]]

    })
  }
  apiEndpointValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    // Allow full URLs
    const urlPattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

    // Allow relative endpoints starting with `/api/` or `/analytics/`
    const relativePattern = /^\/(api|analytics)\/[^\s]*$/;

    if (urlPattern.test(value) || relativePattern.test(value)) {
      return null; // Valid
    }

    return { invalidApiEndpoint: true };
  };
}
  onCancel(){
    this.router.navigate(['/datasource/dashboard-datasetMapper'])
  }
}
