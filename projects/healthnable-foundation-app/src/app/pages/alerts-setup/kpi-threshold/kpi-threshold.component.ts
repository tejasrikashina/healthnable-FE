import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectComponent } from '../../../core-components/select/select.component';
import { InputComponent } from '../../../core-components/input/input.component';
import { OnlyNumbersDirective } from '../../../directives/only-numbers.directive';

@Component({
  selector: 'app-kpi-threshold',
  standalone: true,
  imports: [MaterialModule,HeaderComponent,TranslateModule,ReactiveFormsModule,SelectComponent,InputComponent,OnlyNumbersDirective],
  templateUrl: './kpi-threshold.component.html',
  styleUrl: './kpi-threshold.component.scss'
})
export class KpiThresholdComponent implements OnInit{
thresholdForm!:FormGroup
constructor(private fb:FormBuilder){}
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

  triggerValue=[
    {name: 'Once per Breach'},
    {name:'  Every 15 mins'},
    {name: 'Once per Day'}
  ]
   depValue = [
    { name: 'ICU' },
    { name: 'Emergency' },
    { name: 'Radiology' }
  ];
    notificationValue=[
        { name: 'SMS' },
    {name:'E-Mail'},
    { name: 'In-app'}  
  ]
  severityValue=[
        {name: 'Low'},
    {name:'Medium'},
    {name: 'High'}
  ]
  escRoleValue=[
     {name:'ED Manager'},
    {name:'ED Doctor'},
    {name:'ED Nurse'},
  ]
  recipientValue=[
        { name: 'Recipient 1' },
    { name: 'Recipient 2' },
    { name: 'Recipient 3' },
  ]
 unitValue = [
    { name: 'Minutes' },
    { name: 'Hours' },
    { name: 'Count' },
    { name: 'Ratio' },
    { name: 'Percentage' },
  ];
  roleValue=[
    {name:'Floor Supervisor'},
    {name:'IPD Supervisor'},
    {name:'Bed Management Supervisor'},
    {name:'HR Supervisor'}


  ]
ngOnInit(): void {
    this.thresholdForm=this.fb.group({
      dashboard:[''],
      kpi:[''],
kpiName:[''],
operator:[''],
unit:[''],
value:[''],
alertSeverity:['',[Validators.required]],
currentThreshold:[''],
dataType:[''],
metric:[''],
notification:[''],
alertTrigger:['',[Validators.required]],
escalationRole:[''],
  conditions: this.fb.array([]),
escTime:[''],
department:[''],
role:[''],
enable:[''],
addRecipient:[''],
time:['']
    })
}
isChecked(ev:boolean, controlName:string){
    const roleControl = this.thresholdForm.get('escalationRole')  || this.thresholdForm.get('escTime')

 
  if (controlName === 'enable') {
    if (ev) {

      roleControl?.setValidators([Validators.required]);

    } else {

      roleControl?.clearValidators();
      roleControl?.setValue('');

    }
    roleControl?.updateValueAndValidity();
   

  }
}
  createCondition(): FormGroup {
    return this.fb.group({
operator:[''],
unit:[''],
value:[''],
    });
  }
     get conditionFormArray(): FormArray {
    return this.thresholdForm.get('conditions') as FormArray;
  }
  getFilterGroup(index: number): FormGroup {
  return this.conditionFormArray.at(index) as FormGroup;
}
addCondition(){
   this.conditionFormArray.push(this.createCondition());
}
removeCondition(index:number){
   this.conditionFormArray.removeAt(index);
}
resetThreshold(){
  this.thresholdForm.reset()
}
}
