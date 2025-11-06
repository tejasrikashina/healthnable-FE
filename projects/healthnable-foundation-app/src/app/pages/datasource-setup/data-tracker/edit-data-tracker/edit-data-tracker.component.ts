import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TableComponent } from '../../../../core-components/table/table.component';
import { OnlyNumbersDirective } from '../../../../directives/only-numbers.directive';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { trackerData } from '../../../../type-models/dashboard';
import { DeleteDialogComponent } from '../../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-data-tracker',
  standalone: true,
  imports: [MaterialModule,HeaderComponent,TranslateModule,SelectComponent,ReactiveFormsModule,TableComponent,PrimeNGModule,InputComponent,OnlyNumbersDirective],
  templateUrl: './edit-data-tracker.component.html',
  styleUrl: './edit-data-tracker.component.scss'
})
export class EditDataTrackerComponent {
 constructor(private fb:FormBuilder, private _healthnableCoreService:HealthnableCoreService,private dialog:MatDialog, private translate:TranslateService){
        translate.get('dataTracker').subscribe((tags: string) => { this.tags = tags });
 }
    tags:any
   dep:boolean=true
  dataList: trackerData[] = [];
datatrackerForm!:FormGroup
gridRemoveOptionSubscription!:Subscription
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
dashboardName:[''],
kpiName:[''],
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
