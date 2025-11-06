import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-department',
  standalone: true,
  imports: [MaterialModule,TranslateModule],
  templateUrl: './view-department.component.html',
  styleUrl: './view-department.component.scss'
})
export class ViewDepartmentComponent {
  constructor(public dialogRef: MatDialogRef<ViewDepartmentComponent>) {}
  headers: string[] = [
    'Department Code',
    'Department Name',
    'Organization',
    'Facility',
    'Description',
    'Status',
    'Created By',
    'Created On',
    'Last Modified By',
    'Last Modified On'
  ];
  rows: { [key: string]: string }[] = [
    {
      'Department Code': 'DEPT-001',
      'Department Name': 'Cardiology',
      "Organization": 'Mercy Health System',
      "Facility": 'St. Louis Regional Office',
      "Description": 'Handles all cardiac care including surgery and ICU',
      'Status': 'Active',
      'Created By': 'admin@mercyhealth.org',
      'Created On': '2024-05-01',
      'Last Modified By': 'john.doe@mercyhealth.org',
      'Last Modified On': '2024-06-15',      
    },
  ];

  onCancel() {
    this.dialogRef.close();
  }
}
