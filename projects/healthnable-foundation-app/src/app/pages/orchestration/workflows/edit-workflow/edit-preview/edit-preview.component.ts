import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HealthnableCoreService } from '../../../../../core-components/healthnable-core.service';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '../../../../../core-components/table/table.component';
import { HeaderComponent } from '../../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../../material/material.module';

@Component({
  selector: 'app-edit-preview',
  standalone: true,
  imports: [MaterialModule,HeaderComponent, TranslateModule,TableComponent],
  templateUrl: './edit-preview.component.html',
  styleUrl: './edit-preview.component.scss'
})
export class EditPreviewComponent implements OnInit {
 displayedColumns=['role', 'department','permission'];
  displayedColumns1=['condition','action'];
  displayedColumns2=['event','recipient']
  headers: string[] = ["Name", "Description", "Effective Date"];
  rows: { [key: string]: string }[] = [{
    "Name": "Incident management Workflow",
    "Description": "Tracks incidents from creation to resolution",
    "Effective Date": "From 01-03-2025 - To 31/12/2025",
  }];
  headers1:any=["New","Under Investigation","Pending Corrective Action","Resolved"]
  constructor(private router:Router,private _healthnableCoreService: HealthnableCoreService, ){}
  ngOnInit(){
    // this.rolesList()
    // this.workFlowList()
    // this.notificationList()
  }
  dataList=
  [
    {
        "role": "Compliance Manager",
        "department": "Mental Health",
        "permission": "Full Edit",
    },
    {   
      "role": "Investigator",
      "department": "Nephrology",
      "permission": "View Only",   
    },

]
dataList1=
[
  {
      "condition": "If Stage = “Pending CA”",
      "action": "Escalate to Senior Officer",

  },
  {   
    "condition": "If Risk Level = “High”",
    "action": "Notify Compliance Team",   
  },

]
dataList2=
[
  {
      "event": "Stage Change to Review",
      "recipient": "Compliance Manager (Email)",
  },
  {   
    "event": "Risk Level High ",
    "recipient": "Senior Analyst (Slack)", 
  },

]
  // rolesList(){
  //   this._healthnableCoreService.tableData.next(this.dataList);  
  // }
  // workFlowList(){
  //   this._healthnableCoreService.tableData.next(this.dataList1);  
  // }
  // notificationList(){
  //   this._healthnableCoreService.tableData.next(this.dataList2);  
  // }
  onCancel()
  {
    this.router.navigate(['/orchestration/edit-workflow'])
  }
  previous(){
    this.router.navigate(['/orchestration/edit-set-notification'])
  }
}
