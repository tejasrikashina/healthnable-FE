import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TableComponent } from '../../../../core-components/table/table.component';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
@Component({
  selector: 'app-view-floor',
  standalone: true,
  imports: [MaterialModule,TranslateModule,TableComponent],
  templateUrl: './view-floor.component.html',
  styleUrl: './view-floor.component.scss'
})
export class ViewFloorComponent implements OnInit{
 constructor(public dialogRef: MatDialogRef<ViewFloorComponent>,private _healthnableCoreService: HealthnableCoreService,) {}
 displayedColumns=['zoneName','purpose']
 ngOnInit() {
     this.viewFloorList()
 }
   headers: string[] = [
    'Floor Code',
    'Floor Name',
    'Facility Name',
    'Floor Level',
    'Functional Type',
    'Supported Bed Types',
    'Floor Capacity',
  ];
  rows: { [key: string]: string }[] = [
    {
      'Floor Code': 'CCU-3F',
      'Floor Name': '3rd Floor - ICU',
      "Facility Name": 'Mercy General Hospital - San Diego, CA',
      "Floor Level": '3',
      "Functional Type": 'Clinical',
      'Supported Bed Types': 'ICU, Isolation',
      'Floor Capacity': '48',    
    },
  ];
   headers1: string[] = [
    'RTLS Coverage Zones',
    'Cleaning Protocol',
    'Fire Safety Compliant?',
    'Emergency Exit Count',
    'HVAC/ BMS Code',
    'RTLS UID',
    'Floor Map',
     'Notes/Description',
    'Status'
  ];
   rows1: { [key: string]: string }[] = [
    {
      'RTLS Coverage Zones': 'Zone A, Zone B',
      'Cleaning Protocol': 'High-touch',
      "Fire Safety Compliant?": 'Yes',
      "Emergency Exit Count": '3',
      "HVAC/ BMS Code":'BMS-C3-HVAC-789',
      "RTLS UID":'RTLS-FLR_CCU-3',
      "Floor Map": 'View Map : CCU-3F-Fllor.svg',
      'Notes/Description': 'Stroke + trauma isolation zone',    
      'Status': 'Active',
    },
  ];
   dataList = [
    {
      zoneName: 'Zone A',
      purpose: 'Post-Surgical Recovery'
    },
    {
    zoneName: 'Zone B',
      purpose:'Adult ICU'
    },
  ];
      viewFloorList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
  onCancel() {
    this.dialogRef.close();
  }
}
