import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectComponent } from '../../../core-components/select/select.component';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';
import { PrimeNGModule } from '../../../material/primeng.module';
import { InputComponent } from '../../../core-components/input/input.component';
import { OnlyNumbersDirective } from '../../../directives/only-numbers.directive';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { trackerData } from '../../../type-models/dashboard';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-data-tracker',
  standalone: true,
  imports: [MaterialModule,HeaderComponent,TranslateModule,SelectComponent,ReactiveFormsModule,TableComponent,PrimeNGModule,InputComponent,OnlyNumbersDirective],
  templateUrl: './data-tracker.component.html',
  styleUrl: './data-tracker.component.scss'
})
export class DataTrackerComponent implements OnInit{
  constructor(private fb:FormBuilder, private _healthnableCoreService:HealthnableCoreService,private router:Router,private dialog:MatDialog,private translate:TranslateService){
      translate.get('dataTracker').subscribe((tags: string) => { this.tags = tags });
  }
    tags:any
   dep:boolean=true
    dataList: trackerData[] = [];
    gridEditOptionSubscription!:Subscription
    gridRemoveOptionSubscription!:Subscription
datatrackerForm!:FormGroup
  displayedColumns:string[]=['kpiName','lastSync','expectedInt','selectedAlert','bothaction']
  alert:any[]=[
    { name: 'Yes', key: 'A' },
    { name: 'No', key: 'M' },
  ]
  dashboardValue = [
    { name: 'Outpatient Flow' },
    {name:'Inpatient Flow'},
    { name: 'Bed occupancy & availability'}  , 
     {name:'Workforce Management'},
    { name: 'Revenue Cycle & Financial'}
  ];
    datasetValue = [
    { name: 'ED Dataset' },
    { name: 'ICU Tracker' },
    { name: 'OR Logs' }
  ];
  kpiValue=[
    {name:'ED Avg Wait Time'},
{name:'ED Census'}
  ];
    syncValue=[
    {name:'Updated_at'},
{name:'sync_time'}
  ];
    refreshValue=[
    { name: '5 mins' },
    {name:'10 mins'},
    { name: '15 mins'},
    {name:'20 mins'},
    {name:'25 mins'},
    {name:'30 mins'}
  ]
  
ngOnInit() {
    this.datatrackerForm=this.fb.group({
dashboardName:['',[Validators.required]],
kpiName:['',[Validators.required]],
sourceDataset:[''],
lastSync:[''],
expectedInt:[''],
acceptableDelay:[''],
selectedAlert:[]

    })
        this.dataList = [
      {
        kpiName: 'Patient Waiting > 30 mins',
        lastSync: 'Big KPI',
        expectedInt: '5 mins',
        selectedAlert:'Yes',
       
      },
      {
        kpiName: 'No-Show Rate',
        lastSync:  'Gauge Chart',
        expectedInt: '30 mins',
        selectedAlert:'Yes',
      
      },
    ];
     this.dataTrackerList()
       this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'datatracker') {
        this.router.navigate(['datasource/dashboard-dataTracker/edit-dataTracker']);
      }
    });
     this.gridRemoveOptionSubscription = 
    this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
      if (res.tableName === 'datatracker') {
    
        this.deleteDataTracker('Delete', { data: res.data });
      }
    });
}
dataTrackerList(){
   this._healthnableCoreService.tableData.next(this.dataList); 
}
addMapping(){
  if(this.datatrackerForm.valid){
      const rawValue = this.datatrackerForm.value;
        const transformedEntry: trackerData = {
          ...rawValue,
          kpiName : rawValue.kpiName?.name || '',
          lastSync : rawValue.lastSync?.name || '',
          expectedInt: rawValue.expectedInt?.name,
          selectedAlert:rawValue.selectedAlert
       
        };
        this.dataList.push(transformedEntry);
        this._healthnableCoreService.tableData.next(this.dataList);
        this.datatrackerForm.reset();
      }
}
deleteDataTracker(action: string, obj: any) {
   let dialogRef = this.dialog.open(DeleteDialogComponent, {
                  data: {obj,
                    tags:this.tags,
                    dependencies:this.dep
                     },
                     width: '450px' ,
                     disableClose: true
                });
                dialogRef.afterClosed().subscribe((res: any) => {
                  if (res === 'cancel' || !res) {
                  
                  } 
                 
                });
}
}
