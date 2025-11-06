import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { InputComponent } from '../../../../core-components/input/input.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TableComponent } from '../../../../core-components/table/table.component';


@Component({
  selector: 'app-change-workflow',
  standalone: true,
  imports: [MaterialModule,SelectComponent,InputComponent,ReactiveFormsModule,TranslateModule,TableComponent],
  templateUrl: './change-workflow.component.html',
  styleUrl: './change-workflow.component.scss'
})
export class ChangeWorkflowComponent implements OnInit{
  form!:FormGroup
  headers: any = ["Entity Id","Entity Name", "Entity Type"]
  displayedColumns=['changedBy','previousWF','netWF','date']
   constructor( private fb:FormBuilder,public dialogRef: MatDialogRef<ChangeWorkflowComponent>){ }
   
    ngOnInit(){
this.form=this.fb.group({
  currentworkflow:[''],
  networkflow:[''],
  workflowstage:['']

})
    }
  onCancel()
  {
    this.dialogRef.close();
  
  }
}
