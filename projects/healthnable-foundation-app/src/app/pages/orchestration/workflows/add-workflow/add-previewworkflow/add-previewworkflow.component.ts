import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../../material/material.module';
import { HeaderComponent } from '../../../../../layouts/full/vertical/header/header.component';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '../../../../../core-components/table/table.component';
import { HealthnableCoreService } from '../../../../../core-components/healthnable-core.service';

@Component({
  selector: 'app-add-previewworkflow',
  standalone: true,
  imports: [MaterialModule,HeaderComponent, TranslateModule,TableComponent],
  templateUrl: './add-previewworkflow.component.html',
  styleUrl: './add-previewworkflow.component.scss'
})
export class AddPreviewworkflowComponent implements OnInit{
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
    this.router.navigate(['/orchestration/workflows'])
  }
  previous(){
    this.router.navigate(['/orchestration/set-notification'])
  }
}
