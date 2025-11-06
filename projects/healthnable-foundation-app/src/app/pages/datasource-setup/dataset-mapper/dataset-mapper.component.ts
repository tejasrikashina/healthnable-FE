import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectComponent } from '../../../core-components/select/select.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableComponent } from '../../../core-components/table/table.component';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dataset-mapper',
  standalone: true,
  imports: [HeaderComponent,MaterialModule,TranslateModule,SelectComponent,ReactiveFormsModule,TableComponent],
  templateUrl: './dataset-mapper.component.html',
  styleUrl: './dataset-mapper.component.scss'
})
export class DatasetMapperComponent implements OnInit {
  datasetForm!:FormGroup
    gridEditOptionSubscription!: Subscription;
    gridRemoveOptionSubscription!:Subscription
  displayedColumns:string[]=['metricName','sourceDataset','apiEndpoint','bothaction']
  dashboardValue = [
    { name: 'Outpatient Flow' },
    {name:'Inpatient Flow'},
    { name: 'Bed occupancy & availability'}  , 
     {name:'Workforce Management'},
    { name: 'Revenue Cycle & Financial'}
  ];
  headers: string[] = ["Last Synced", "Synced By", "Status"];
  rows: { [key: string]: string }[] = [{
    "Last Synced": "May 02, 2025 11:38 AM",
    "Synced By": "DataOps Bot",
    "Status": "Ok",
  }];
  tags:any
   dep:boolean=true
  constructor(private fb:FormBuilder,private _healthnableCoreService:HealthnableCoreService, private translate: TranslateService,private router:Router,private dialog:MatDialog){
         translate.get('dataset').subscribe((tags: string) => { this.tags = tags });
  }
  ngOnInit() {
     this.datasetForm=this.fb.group({
      dashboard:['',[Validators.required]],
     }) 
     this.datasetList()
        this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'dataset') {
        this.router.navigate(['/datasource/dashboard-datasetMapper/edit-datasetmapping']);
      }
    });
     this.gridRemoveOptionSubscription = 
    this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
      if (res.tableName === 'dataset') {
    
        this.deleteDatasetMapper('Delete', { data: res.data });
      }
    });
  }
  dataList=[
    {
      metricName:'OP Registration Today',
      sourceDataset:'OPD Visit Dataset',
      apiEndpoint:'/api/opd/registration'
    },
    {
      metricName:'Appointment Scheduled vs Walk-ins',
      sourceDataset:'Appointment Dataset',
      apiEndpoint:'/api/appointments'
    }
  ]

       deleteDatasetMapper(action: string, obj: any) {
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
  
  datasetList(){
    this._healthnableCoreService.tableData.next(this.dataList); 
  }
  addMapping(){
    this.router.navigate(['/datasource/dashboard-datasetMapper/add-datasetmapping'])
  }
  reset(){
    this.datasetForm.reset()
  }
}
