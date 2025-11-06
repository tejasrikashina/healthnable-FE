import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-facility',
  standalone: true,
  imports: [MaterialModule,TranslateModule],
  templateUrl: './view-facility.component.html',
  styleUrl: './view-facility.component.scss'
})
export class ViewFacilityComponent {
  constructor(public dialogRef: MatDialogRef<ViewFacilityComponent>) {}
  headers: string[] = [
    'Facility Code',
    'Facility Name',
    'Address Line 1',
    'Address Line 2',
    'City',
    'State',
    'Country',
    'Zip Code',
    'Phone Number',
    'Time Zone',
    'Primary Contact',
    'Contact Email',
    'Default language',
    'Status',
    'Logo',
    'Favicon',
    'Notes/Description'
  ];
  rows: { [key: string]: string }[] = [
    {
      'Facility Code': 'FAC-001',
      'Facility Name': 'Mercy Health Systems',
      "Address Line 1": '123 Healing Way',
      "Address Line 2": 'Suite 300',
      "City": 'St. Louis',
      'State': 'Active',
      'Country': 'United States',
      'Zip Code': '63110',
      'Phone Number': '+1 (314) 555-1234',
      'Time Zone': 'Eastern Daylight Time (GMT-4)',
      'Primary Contact': 'Sarah Thompson',
      'Contact Email': 'admin@mercyhealth.org',
      'Default language': 'English',
      'Status': 'Active',
      "Logo": '',
      'Favicon': '',
      'Notes/Description': 'Mercy is a not-for-profit health system ......',
      
    },
  ];

  onCancel() {
    this.dialogRef.close();
  }
}
