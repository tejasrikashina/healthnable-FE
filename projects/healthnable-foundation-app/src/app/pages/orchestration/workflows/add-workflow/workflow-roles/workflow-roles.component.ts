import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { HealthnableCoreService } from '../../../../../core-components/healthnable-core.service';
import { SelectComponent } from '../../../../../core-components/select/select.component';
import { TableComponent } from '../../../../../core-components/table/table.component';
import { HeaderComponent } from '../../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../../material/material.module';




@Component({
  selector: 'app-workflow-roles',
  standalone: true,
 imports: [MaterialModule, HeaderComponent, TranslateModule,ReactiveFormsModule,SelectComponent,TableComponent],
  templateUrl: './workflow-roles.component.html',
  styleUrl: './workflow-roles.component.scss'
})
export class WorkflowRolesComponent implements OnInit{
  form!:FormGroup
  displayedColumns:any=['role','department','stage','permission']
constructor(private translate:TranslateService, private fb:FormBuilder, private router:Router,private _healthnableCoreService: HealthnableCoreService,){
}
locationValue = [
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' },
];
ngOnInit(){
  this.workflowRolesList()
this.form=this.fb.group({
  workflowrole:[''],
  department:[''],
  edit:[false],
  view:[false],
  access:[false]
})
}
onCancel(){
  this.router.navigate(['/orchestration/add-workflow'] )
}
next(){
  this.router.navigate(['/orchestration/set-workflow'] )
}
dataList=
  [
    {
      "role":"Compliance Manager",
      "department":"MH",
       "stage": "New",
       "permission": "Full Edit",

    },
  
 
]
workflowRolesList(){
  this._healthnableCoreService.tableData.next(this.dataList);    
}
}
