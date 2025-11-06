import { Component } from '@angular/core';
import { TableComponent } from '../../../../../core-components/table/table.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-workflow',
  standalone: true,
  imports: [TableComponent,MaterialModule,TranslateModule],
  templateUrl: './view-workflow.component.html',
  styleUrl: './view-workflow.component.scss'
})
export class ViewWorkflowComponent {
   constructor( private dialogRef:MatDialogRef<ViewWorkflowComponent>){
    }
    headers: any = ["Workflow Name","Entity Type","Description", "Status"]
  displayedColumns=['stageName','stageType','nextStage']
  displayedColumns1=['entityId','name','currentStage','status']
  displayedColumns2=['ruleName','condition']
  onCancel()
  {
    this.dialogRef.close();
  
  }
}
