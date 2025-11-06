import { Component } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-room',
  standalone: true,
  imports: [MaterialModule, TranslateModule],
  templateUrl: './view-room.component.html',
  styleUrl: './view-room.component.scss'
})
export class ViewRoomComponent {
  constructor(public dialogRef: MatDialogRef<ViewRoomComponent>){}
  headers: string[] = [
    'Room Code',
    'Room Name',
    'Room Type',
    'Ward',
    'Floor',
    'Facility',
    'Bed Capacity',
    'Is Private Room?',
    'Gender-Specific?',
    'Cleaning Category',
    'Fire Safety Complaint',
    'HVAC/BMS Code',
    'RTLS UID',
    'Status',
    'Notes/Description'
  ];
  rows: { [key: string]: string }[] = [
    {
       'Room Code':'Mercy General Hospital - San Diego, CA',
    'Room Name':'3rd Floor - Critical Care Unit',
    'Room Type':'ICU Ward - East Wing',
    'Ward':'ICU Room - 301',
    'Floor':'ICU - 301',
    'Facility':'Isolation',
    'Bed Capacity':'2',
    'Is Private Room?':'Yes',
    'Gender-Specific?':'Female Only',
    'Cleaning Category':'Isolation',
    'Fire Safety Complaint':'Yes',
    'HVAC/BMS Code':'HVAC - RM - 301',
    'RTLS UID':'RTLS - RM - 301',
    'Status':'Active',
    'Notes/Description':'Isolation - Capable negative pressure ICU room'
    },
  ];
    onCancel() {
    this.dialogRef.close();
  }
}
