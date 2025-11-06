import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectComponent } from '../../../../../core-components/select/select.component';
import { TableComponent } from '../../../../../core-components/table/table.component';
import { HeaderComponent } from '../../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../../material/material.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-workflow-roles',
  standalone: true,
  imports: [MaterialModule, HeaderComponent, TranslateModule,ReactiveFormsModule,SelectComponent,TableComponent],
  templateUrl: './edit-workflow-roles.component.html',
  styleUrl: './edit-workflow-roles.component.scss'
})
export class EditWorkflowRolesComponent implements OnInit{
form!:FormGroup
  displayedColumns:any=['role','department','stage','permission']
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
  workflowrole:[''],
  department:[''],
  edit:[false],
  view:[false],
  access:[false]
})
}
onCancel(){
  this.router.navigate(['/orchestration/edit-workflow'] )
}
next(){
  this.router.navigate(['/orchestration/edit-set-workflow'] )
}
}
