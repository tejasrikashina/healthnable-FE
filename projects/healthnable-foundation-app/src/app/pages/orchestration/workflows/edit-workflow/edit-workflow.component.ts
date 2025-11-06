import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CalendarComponent } from '../../../../core-components/calendar/calendar.component';
import { InputComponent } from '../../../../core-components/input/input.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-workflow',
  standalone: true,
imports: [MaterialModule, HeaderComponent, TranslateModule,ReactiveFormsModule,InputComponent, PrimeNGModule],
  templateUrl: './edit-workflow.component.html',
  styleUrl: './edit-workflow.component.scss'
})
export class EditWorkflowComponent implements OnInit{
 form!:FormGroup
constructor(private translate:TranslateService, private fb:FormBuilder, private router:Router){
  
}
locationValue = [
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' },
];
ngOnInit(){
this.form=this.fb.group({
  // code:[''],
name:['',[Validators.required]],
description:['',[Validators.required]],
fromDate:[''],
toDate:['']

})
}
next(){
  this.router.navigate(['/orchestration/edit-workflow-roles'])
}
onCancel()
{
  this.router.navigate(['/orchestration/workflows'])
}
}
