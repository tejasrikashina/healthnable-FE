import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../../material/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { TableComponent } from '../../../../core-components/table/table.component';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';

@Component({
  selector: 'app-drilldown-preview',
  standalone: true,
  imports: [MaterialModule,TranslateModule, ReactiveFormsModule, TableComponent],
  templateUrl: './drilldown-preview.component.html',
  styleUrl: './drilldown-preview.component.scss'
})
export class DrilldownPreviewComponent implements OnInit{
  constructor(public dialogRef: MatDialogRef<DrilldownPreviewComponent>, private _healthnableCoreService: HealthnableCoreService,){}
  ngOnInit() {
      this.previewList()
  }
  displayedColumns: string[] = [
    'patientName',
    'appointmentName',
    'provider',
    'contactInfo',
    'status',
  ];
  headers: string[] = ["Drilldown From KPI", "Dashboard Context", "Navigation Mode","Target Object","Filter Applied"];
  rows: { [key: string]: string }[] = [{
    "Drilldown From KPI": "No-Show Rate",
    "Dashboard Context": "Outpatient Flow",
    "Navigation Mode":"Open in New Tab",
    "Target Object": "Appointment",
    "Filter Applied":"Status = 'No Show' and Date = Today"
  }];
  onCancel(){
    this.dialogRef.close()
   }
  dataList = [
    {
      patientName: 'Fatima Yusuf',
      appointmentName: '10:30 AM',
      provider: 'Dr. Rahim',
      contactInfo: '9876543210',
      status: 'No-Show',

    },
    {
      patientName: 'Hussain AL-Mazrui',
      appointmentName: '11:45 AM',
      provider: 'Dr. Ayesha',
      contactInfo: '6789451230',
      status: 'No-Show',

    },
  ]
   previewList(){
    this._healthnableCoreService.tableData.next(this.dataList);
   }
}
