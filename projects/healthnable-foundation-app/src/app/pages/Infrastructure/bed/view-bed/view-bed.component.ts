import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../../material/material.module';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-bed',
  standalone: true,
  imports: [MaterialModule,TranslateModule],
  templateUrl: './view-bed.component.html',
  styleUrl: './view-bed.component.scss'
})
export class ViewBedComponent{
  constructor(public dialogRef: MatDialogRef<ViewBedComponent>){}
  headers: string[] = [
    'Bed Code',
    'Bed Name',
    'Bed Type',
    'Facility',
    'Floor',
    'Ward',
    'Room',
    'Isolation Capable?',
    'RTLS UID',
    'Notes/Description'
  ];
  rows: { [key: string]: string }[] = [
    {
      'Bed Code': 'BED-ICU-301-A',
      'Bed Name': 'BED-A',
      "Bed Type": 'ICU',
      "Facility": 'Mercy General Hospital - San Diego, CA',
      "Floor": '3rd Floor - Cr',
      'Ward': 'ICU, Isolation',
      'Room':'ICU Room - 301',
    'Isolation Capable?':'Yes',
    'RTLS UID':'3',
    'Notes/Description':'Stroke + trauma isolation Zone'   
    },
  ];
    onCancel() {
    this.dialogRef.close();
  }
}
