import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeNGModule } from '../../../material/primeng.module';
import { SelectComponent } from '../../../core-components/select/select.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../core-components/input/input.component';
import { StatusComponent } from '../../../core-components/status/status.component';

@Component({
  selector: 'app-metric-action-mapper',
  standalone: true,
  imports: [MaterialModule,TranslateModule,PrimeNGModule,SelectComponent,HeaderComponent,ReactiveFormsModule,InputComponent,StatusComponent],
  templateUrl: './metric-action-mapper.component.html',
  styleUrl: './metric-action-mapper.component.scss'
})
export class MetricActionMapperComponent implements OnInit {
  constructor(private fb:FormBuilder){}
metricActionMapper!:FormGroup
viaReq:boolean=false
escReq:boolean=false
taskReq:boolean=false
workflowReq:boolean=false
urlReq:boolean=false
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
  viaValue=[
        { name: 'SMS' },
    {name:'E-Mail'},
    { name: 'In-app'}  
  ]
  status!:boolean;
status1!:boolean
ngOnInit(): void {
    this.metricActionMapper=this.fb.group({
dashboard:['',[Validators.required]],
metric:['',[Validators.required]],
notify:[''],
via:[''],
workflowName:[''],
escalation:[''],
creatTask:[''],
trigger:[''],
taskCategory:[''],
taskForm:[''],
dashboardTile:[true],
threshold:[true],
extUrl:[''],
url:['',Validators.pattern('https?://.+')],
escalateRole:[''],
externalLink:['']
    })
}

isChecked(ev:boolean, controlName:string){
    const viaControl = this.metricActionMapper.get('via');
const escalationControl=this.metricActionMapper.get('escalation')
const createTaskControl=this.metricActionMapper.get('taskCategory') || this.metricActionMapper.get('taskForm')
const triggerControl=this.metricActionMapper.get('workflowName')
const urlControl=this.metricActionMapper.get('url')
 
  if (controlName === 'notify') {
    if (ev) {
this.viaReq=true
      viaControl?.setValidators([Validators.required]);
    } else {
this.viaReq=false
      viaControl?.clearValidators();
      viaControl?.setValue('');
    }
    viaControl?.updateValueAndValidity();
  }

  if (controlName === 'escalateRole') {
    if (ev) {
    this.escReq=true
      escalationControl?.setValidators([Validators.required]);
    } else {
this.escReq=false
      escalationControl?.clearValidators();
      escalationControl?.setValue('');
    }
    escalationControl?.updateValueAndValidity();
  }
   if (controlName === 'createTask') {
    if (ev) {
this.taskReq=true
      createTaskControl?.setValidators([Validators.required]);
    } else {
this.taskReq=false
      createTaskControl?.clearValidators();
      createTaskControl?.setValue('');
    }
    createTaskControl?.updateValueAndValidity();
  }
   if (controlName === 'trigger') {
    if (ev) {
this.workflowReq=true
      triggerControl?.setValidators([Validators.required]);
    } else {
this.workflowReq=false
      triggerControl?.clearValidators();
      triggerControl?.setValue('');
    }
    triggerControl?.updateValueAndValidity();
  }
   if (controlName === 'extUrl') {
    if (ev) {
this.urlReq=true
      urlControl?.setValidators([Validators.required,Validators.pattern('https?://.+')]);
    } else {
this.urlReq=false
 urlControl?.setValidators([Validators.pattern('https?://.+')]);
      urlControl?.clearValidators();
      urlControl?.setValue('');
    }
    urlControl?.updateValueAndValidity();
  }
}
  onStatusChange(): void {
    this.status = this.metricActionMapper.get('dashboardTile')?.value;
    this.status1= this.metricActionMapper.get('threshold')?.value;
  }
  resetMapper(){
this.metricActionMapper.reset()
  }
}
