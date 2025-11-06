import { Component } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-nurse-station',
  standalone: true,
  imports: [MaterialModule,TranslateModule],
  templateUrl: './view-nurse-station.component.html',
  styleUrl: './view-nurse-station.component.scss'
})
export class ViewNurseStationComponent {
  constructor(public dialogRef: MatDialogRef<ViewNurseStationComponent>){}
  headers: string[] = [
    'Nurse Station Code',
    'Nurse Station Name',
    'Facility',
    'Floor',
    'Serving Wards',
    'Functional Role',
    'Is Central Station',
    'RTLS UID',
    'HVAC/BMS Code',
    'Status',
    'Description'
  ];
  rows: { [key: string]: string }[] = [
    {
        'Nurse Station Code':'NS-CCU-A',
    'Nurse Station Name':'Nurse Station A - Cardiac',
    'Facility':'Mercy General Hospital - San Diego CA',
    'Floor':'3rd Floor - Critical Care Unit(CCU-3F)',
    'Serving Wards':'ICU Ward- East Wing, ICU Ward-South Wing',
    'Functional Role':'General Care, ICU Support, Pediatric Coverage',
    'Is Central Station':'Yes',
    'RTLS UID':'RTLS-NS-CCU-A',
    'HVAC/BMS Code':'RTLS-NS-CCU-A',
    'Status':'Active',
    'Description':'Central command for cardiac ICU nurse operation'  
    },
  ];
    onCancel() {
    this.dialogRef.close();
  }
}
