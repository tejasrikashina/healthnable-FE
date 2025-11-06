import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../../material/material.module';

@Component({
  selector: 'app-view-speciality',
  standalone: true,
  imports: [MaterialModule, TranslateModule],
  templateUrl: './view-speciality.component.html',
  styleUrl: './view-speciality.component.scss'
})
export class ViewSpecialityComponent {
  constructor(public dialogRef: MatDialogRef<ViewSpecialityComponent>) {}
  headers: string[] = [
    'Specialty Code',
    'Specialty Name',
    'Description',
    'Status',
    'parent Specialty',
    'Department',
    'Created Date',
    'Created By'
  ];
  rows: { [key: string]: string }[] = [
    {
      'Specialty Code': 'SPEC-001',
      'Specialty Name': 'Cardiology',
      "Description": 'Deals with heart-related disorders and condition',
      "Status": 'Active',
      "parent Specialty": 'Internal Medicine',
      'Department': 'Clinical Department',
      'Created Date': '2024-12-15',
      'Created By': 'john.doe@hospital.org',
   
    },
  ];

  onCancel() {
    this.dialogRef.close();
  }
}
