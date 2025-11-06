import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TableComponent } from '../../../../core-components/table/table.component';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-view-workflow',
  standalone: true,
  imports: [MaterialModule,TranslateModule,StatusComponent, ReactiveFormsModule],
  templateUrl: './view-workflow.component.html',
  styleUrl: './view-workflow.component.scss'
})
export class ViewWorkflowComponent implements OnInit{
  displayedColumns=['stageName', 'assignedentity','nextPossibleStage','bothaction'];
  dataSource = new MatTableDataSource<any>();
  displayedColumns1=['entityId','entityName','currentStage',"stage",'bothaction'];
  displayedColumns2=['stageName','assignedentity','bothaction']
  headers: string[] = ["Workflow Name", "Entity Type", "Description"];
  rows: { [key: string]: string }[] = [{
    "Workflow Name": "Onboarding Process",
    "Entity Type": "Employee",
    "Description": "Standard onboarding steps for new hires",
  }];
constructor(public dialogRef: MatDialogRef<ViewWorkflowComponent>, private fb:FormBuilder){}
  form!: FormGroup;
  status!:boolean;
  onCancel(){
    this.dialogRef.close()
   }
   ngOnInit(){
      this.form = this.fb.group({
        status: [{ value: true, disabled: true }],
   })
  }
  onStatusChange() {
    this.status = this.form.get('status')?.value;
   
  }
}
