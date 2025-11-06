import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectComponent } from '../../../../../core-components/select/select.component';
import { TableComponent } from '../../../../../core-components/table/table.component';
import { HeaderComponent } from '../../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../../material/material.module';
import { Router } from '@angular/router';
import { InputComponent } from '../../../../../core-components/input/input.component';
import { PrimeNGModule } from '../../../../../material/primeng.module';

@Component({
  selector: 'app-set-workflow',
  standalone: true,
 imports: [MaterialModule, HeaderComponent,PrimeNGModule, TranslateModule,ReactiveFormsModule,SelectComponent,InputComponent],
  templateUrl: './set-workflow.component.html',
  styleUrl: './set-workflow.component.scss'
})
export class SetWorkflowComponent implements OnInit{
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
    this.router.navigate(['/orchestration/add-workflow'] )
  }
  next(){
    this.router.navigate(['/orchestration/set-notification'] )
  }
  previous(){
    this.router.navigate(['/orchestration/workflow-roles'] )
  
  }
}
