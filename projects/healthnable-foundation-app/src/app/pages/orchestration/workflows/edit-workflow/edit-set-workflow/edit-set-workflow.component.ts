import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputComponent } from '../../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../../core-components/select/select.component';
import { HeaderComponent } from '../../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../../material/material.module';
import { PrimeNGModule } from '../../../../../material/primeng.module';

@Component({
  selector: 'app-edit-set-workflow',
  standalone: true,
 imports: [MaterialModule, HeaderComponent,PrimeNGModule, TranslateModule,ReactiveFormsModule,SelectComponent,InputComponent],
  templateUrl: './edit-set-workflow.component.html',
  styleUrl: './edit-set-workflow.component.scss'
})
export class EditSetWorkflowComponent implements OnInit{
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
    entity:[''],
    condition:[''],
    tragetRole:[''],
    stage:[''],
    pendingAction:[''],
    action:[''],
    escalation:[''],
    riskLevel:[''],
    high:[''],
    alertCompilance:[''],
  })
  }
  onCancel(){
    this.router.navigate(['/orchestration/edit-workflow'] )
  }
  previous(){
    this.router.navigate(['/orchestration/edit-workflow-roles'])
  }
  next(){
    this.router.navigate(['/orchestration/edit-set-notification'] )
  }
}
