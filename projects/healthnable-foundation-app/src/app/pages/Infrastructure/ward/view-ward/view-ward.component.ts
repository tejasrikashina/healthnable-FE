import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { materialize } from 'rxjs';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-ward',
  standalone: true,
  imports: [MaterialModule,TranslateModule],
  templateUrl: './view-ward.component.html',
  styleUrl: './view-ward.component.scss'
})
export class ViewWardComponent {
constructor(public dialogRef: MatDialogRef<ViewWardComponent>,private _healthnableCoreService: HealthnableCoreService,) {}
headers: string[] = [
    'Ward Code',
    'Ward Name',
    'Ward Type',
    'Facility',
    'Floor',
    'Speciality/Service',
    'Bed Capacity',
    'Is High Dependency',
    'Nurse Safety Mapped',
    'Cleaning Category',
    'Fire Safety Complaint?',
    'Emergency Exists Count',
    'RTLS UID',
    'HVAC/BMS Code',
    'Status',
    'Description'

  ];
  rows: { [key: string]: string }[] = [
    {
      'Ward Code':'ICU-E1',
    'Ward Name':'ICU Ward - East Wing',
    'Ward Type':'ICU',
    'Facility':'Mercy General Hospital - San Diego, CA',
    'Floor':'3rd Floor - Critical Care Unit',
    'Speciality/Service':'Cardiology',
    'Bed Capacity':'12',
    'Is High Dependency':'Yes',
    'Nurse Safety Mapped':'Nurse Section A - Cardiac ICU',
    'Cleaning Category':'High-Touch',
    'Fire Safety Complaint?':'Yes',
    'Emergency Exists Count':'3',
    'RTLS UID':'RTLS-WARD-E1',
    'HVAC/BMS Code':'HVAC-WD-E1',
    'Status':'Active',
    'Description':'Cardiac Intensive ward with 3 isolation beds.'
    },
  ];
  onCancel() {
    this.dialogRef.close();
  }
}
