import { Component, OnInit } from '@angular/core';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../core-components/input/input.component';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { CalendarComponent } from '../../../../core-components/calendar/calendar.component';

@Component({
  selector: 'app-add-workflow',
  standalone: true,
  imports: [MaterialModule,
    PrimeNGModule, HeaderComponent, TranslateModule,ReactiveFormsModule,InputComponent, PrimeNGModule],
  templateUrl: './add-workflow.component.html',
  styleUrl: './add-workflow.component.scss'
})
export class AddWorkflowComponent  implements OnInit{
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
  this.router.navigate(['/orchestration/workflow-roles'])
}
onCancel()
{
  this.router.navigate(['/orchestration/workflows'])
}

}
