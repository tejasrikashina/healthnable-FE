import { Component, OnInit } from '@angular/core';
import { SelectComponent } from '../../../core-components/select/select.component';
import { MaterialModule } from '../../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { TextAreaComponent } from '../../../core-components/text-area/text-area.component';
import { InputComponent } from '../../../core-components/input/input.component';

@Component({
  selector: 'app-communication-setup',
  standalone: true,
  imports: [SelectComponent,MaterialModule,ReactiveFormsModule,HeaderComponent,TranslateModule,TextAreaComponent,InputComponent],
  templateUrl: './communication-setup.component.html',
  styleUrl: './communication-setup.component.scss'
})
export class CommunicationSetupComponent implements OnInit{
  constructor(private fb:FormBuilder){}
  smsReq!:boolean
  emailReq!:boolean
  appReq!:boolean
setupForm!:FormGroup
  metricValue=[
    { name: 'Patient Waiting > 30 mins' },
    {name:'No-Show Rate'},
    { name: 'Average Consultation Time'}  , 
    { name: 'OPD Complaints Logged Today'} 
  ];
alertTypeValue=[
  {name:'Threshold breach'},
  {name:'Manual Task Alert'}
]
additionalRole=[]
  roleValue=[
    {name:'Floor Supervisor'},
    {name:'IPD Supervisor'},
    {name:'Bed Management Supervisor'},
    {name:'HR Supervisor'}


  ]
   depValue = [
    { name: 'ICU' },
    { name: 'Emergency' },
    { name: 'Radiology' }
  ];
ngOnInit(): void {
    this.setupForm=this.fb.group({
body:[''],
message:[''],
smsTemplate:[''],
inApp:[''],
title:['',[
          Validators.maxLength(40)]],
smsMessage:['',[Validators.maxLength(160)]],
appMessage:['',[Validators.maxLength(200)]],
subject:['',[Validators.maxLength(100)]],
metric:[''],
emailTemplate:[''],
alertType:[''],
additionalRole:[''],
targetDep:[''],
targetRole:[''],
snapshot:[''],
timeStamp:['']

    })
}
isChecked(ev:boolean, controlName:string){
  const smsControl = this.setupForm.get('smsMessage')
  const emailControl=this.setupForm.get('subject')
  const emailControl1=this.setupForm.get('body')
  const appControl=this.setupForm.get('title') 
  const appControl1=this.setupForm.get('appMessage')
   if (controlName === 'smsTemplate') {
    if (ev) {
this.smsReq=true
      smsControl?.setValidators([Validators.required,Validators.maxLength(160)]);

    } else {
this.smsReq=false
  smsControl?.setValidators([Validators.maxLength(160)]);

      smsControl?.setValue('');

    }
    smsControl?.updateValueAndValidity();
   

  }
   if (controlName === 'emailTemplate') {
    if (ev) {
this.emailReq=true
      emailControl?.setValidators([Validators.required,Validators.maxLength(100)]);
      emailControl1?.setValidators([Validators.required]);


    } else {
this.emailReq=false
     emailControl?.setValidators([Validators.maxLength(100)]);
      emailControl?.setValue('');
      
      emailControl1?.setValue('');

    }
    emailControl?.updateValueAndValidity();
   

  }
  if (controlName === 'inApp') {
    if (ev) {
this.appReq=true
      appControl?.setValidators([Validators.required,Validators.minLength(3),
          Validators.maxLength(40)]);
appControl1?.setValidators([Validators.required,Validators.maxLength(200)]);

    } else {
      this.appReq=false
 appControl?.setValidators([Validators.minLength(3),
          Validators.maxLength(40)]);
appControl1?.setValidators([Validators.maxLength(200)]);

      appControl?.setValue('');
  
      appControl1?.setValue('');

    }
    appControl?.updateValueAndValidity();
    appControl1?.updateValueAndValidity();

   

  }
}
reset(){
  this.setupForm.reset()
}
}
