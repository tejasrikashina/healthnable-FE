import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { SelectComponent } from '../../../core-components/select/select.component';
import { TableComponent } from '../../../core-components/table/table.component';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { metriclevelData } from '../../../type-models/dashboard';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-metriclevel-access',
  standalone: true,
  imports: [HeaderComponent,ReactiveFormsModule,MaterialModule,TranslateModule,SelectComponent, TableComponent],
  templateUrl: './metriclevel-access.component.html',
  styleUrl: './metriclevel-access.component.scss'
})
export class MetriclevelAccessComponent implements OnInit{
metriclevelForm!:FormGroup
displayedColumns:string[]=['dashboardName','accesibleMetrics','department','facility','bothaction']
 dataList: metriclevelData[] = [];
  gridEditOptionSubscription!: Subscription;
constructor(private fb:FormBuilder,private _healthnableCoreService:HealthnableCoreService,private router:Router){}
roleValue = [
    { name: 'Nurse' },
    { name: 'OT Scheduler' },
    { name: 'ICU Doctor' }
  ];
 depValue = [
    { name: 'ICU' },
    { name: 'Emergency' },
    { name: 'Radiology' }
  ];
facValue = [
    { name: 'Manama Central Hospital' }
  ];
    dashboardValue = [
    { name: 'Outpatient Flow' },
    {name:'Inpatient Flow'},
    { name: 'Bed occupancy & availability'}  , 
     {name:'Workforce Management'},
    { name: 'Revenue Cycle & Financial'}
  ];
  metricValue=[
    { name: 'Patient Waiting > 30 mins' },
    {name:'No-Show Rate'},
    { name: 'Average Consultation Time'}  , 
    { name: 'OPD Complaints Logged Today'} 
  ];
  ngOnInit(){
    this.metriclevelForm=this.fb.group({
role:['',[Validators.required]],
department:['',[Validators.required]],
facility:['',[Validators.required]],
dashboard:['',[Validators.required]],
accMetric:['',[Validators.required]]


    })
    this.dataList = [
      {
        dashboardName: 'ED Dashboard',
        accesibleMetrics: 'ED Wait Time, Boarding Time',
        department: 'Emergency',
        facility: 'Manama Central Hospital',       
      },
      {
        dashboardName: 'ICU Dashboard',
        accesibleMetrics: 'ICU Mortality Rate',
        department: 'ICU',
        facility: 'Manama Central Hospital'
       
      },
    ]
    this.metriclevelList()
    this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'metricLevel') {
        this.router.navigate(['dashboards/dashboard/edit-metricLevel']);
      }
    });
  }
  metriclevelList() {
  this._healthnableCoreService.tableData.next(this.dataList);
}
saveMetricLevel(){
     const rawValue = this.metriclevelForm.value;
      const transformedEntry: metriclevelData = {
        ...rawValue,
        dashboardName: rawValue.dashboard?.name || '',
        accesibleMetrics: rawValue.accMetric?.name || '',
        department: rawValue.department?.name || '',
        facility: rawValue.facility?.name || ''

      };
      this.dataList.push(transformedEntry);
      this._healthnableCoreService.tableData.next(this.dataList);
      this.metriclevelForm.reset();
}
}
