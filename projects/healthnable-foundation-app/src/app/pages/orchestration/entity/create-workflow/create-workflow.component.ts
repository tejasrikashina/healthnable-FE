import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TableComponent } from '../../../../core-components/table/table.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';
import { EntityArchiveComponent } from '../entity-archive/entity-archive.component';

@Component({
  selector: 'app-create-workflow',
  standalone: true,
  imports: [SelectComponent,MaterialModule,TableComponent, TranslateModule,ReactiveFormsModule,InputComponent, PrimeNGModule],
  templateUrl: './create-workflow.component.html',
  styleUrl: './create-workflow.component.scss'
})
export class CreateWorkflowComponent implements OnInit{
  form!:FormGroup
  displayedColumns=['stageName','workflowType','nextStage']
  displayedColumns2=['ruleName','condition']
  constructor( private dialogRef:MatDialogRef<CreateWorkflowComponent>, private fb:FormBuilder,private dialog:MatDialog){
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
    workflowName:['',[Validators.required]],
    entityType:['',[Validators.required]],
  description:['',[Validators.required]],
  status:['',[Validators.required]]
  })
  }
  addStage(action:string,obj:any){
    
  }
  addRule(action:string,obj:any){
    obj.action = action;
    let dialogRef = this.dialog.open(EntityArchiveComponent, {
      data: obj,
      maxWidth: '850px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((res: any) => {});
  }
  onCancel()
  {
    this.dialogRef.close();
  
  }
}
