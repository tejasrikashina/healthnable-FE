import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../../core-components/input/input.component';
import { SelectComponent } from '../../../core-components/select/select.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TextAreaComponent } from '../../../core-components/text-area/text-area.component';
import { StatusComponent } from '../../../core-components/status/status.component';
import { PrimeNGModule } from '../../../material/primeng.module';
import { TableComponent } from '../../../core-components/table/table.component';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { metricData } from '../../../type-models/dashboard';
import { Subscription } from 'rxjs';
import { DeleteKpiComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
@Component({
  selector: 'app-metric',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderComponent,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    TranslateModule,
    TextAreaComponent,
    StatusComponent,
    PrimeNGModule,
    TableComponent,
  ],
  templateUrl: './metric.component.html',
  styleUrl: './metric.component.scss',
})
export class MetricComponent implements OnInit {
    gridRemoveOptionSubscription!: Subscription;
    gridEditOptionSubscription!: Subscription;
  paginationDataSubscription!:Subscription;

    tags:any
  dep:boolean=true
  constructor(
    private fb: FormBuilder,
    private _healthnableCoreService: HealthnableCoreService,
    private dialog:MatDialog,
    private dashService:DashboardService,
    private router:Router,
    private translate: TranslateService
  ) {  translate.get('kpi').subscribe((tags: string) => { this.tags = tags });}
  metricForm!: FormGroup;
  status!:boolean;
  dataList: metricData[] = [];
  displayedColumns: string[] = [
    'kpi_code',
    'kpi_name',
    'unit',
    'frequency',
    'source_dataset',
    'bothaction',
  ];
  unitValue = [];
  freqValue = [
    { name: 'Real-Time' },
    { name: 'Hourly' },
    { name: 'Daily' },
    { name: 'Weekly' }
  ];
  datasetValue = [];
  appDashValue = [
    { name: 'Emergency Department' },
    { name: 'Excecutive Summary' }
  ];
      pageSize:number = 5;
  pageIndex:number = 1;
  ngOnInit() {
    this.getUnits()
    this.getDatasets()
    this.getFrequencies()
    this.metricForm = this.fb.group({
      kpiName: ['' ,[Validators.required, Validators.minLength(3),
          Validators.maxLength(70),Validators.pattern(this._healthnableCoreService.regEx.userName)]],
      unit: [''],
      frequency: [''],
      source: [''],
      applicableDash: [''],
       description:['',[ Validators.maxLength(1000)]],
      status: [true],
    });

        this.metricList(this.pageIndex,this.pageSize);
         this.paginationDataSubscription= this._healthnableCoreService.paginationData.subscribe((res) => {
      if (res.tableName === 'metric' || '') {
        this.metricList(res.pageIndex,res.pageSize);
      }
    })
    this.gridRemoveOptionSubscription = 
    this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
      if (res.tableName === 'metric') {
    
        this.deleteMetric('Delete', { data: res.data });
      }
    });
     this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'metric') {
        this.router.navigate([`/dashboards/dashboard/edit-kpi/${res.data.kpi_code}`]);
      }
    });
  }
  onStatusChange(): void {
    this.status = this.metricForm.get('status')?.value;
  }
  metricList(pageIndex:number, pageSize:number){
  this.dashService.getKPIs(pageIndex, pageSize).subscribe({
    next:(dataList:any)=>{
 this._healthnableCoreService.tableData.next(dataList.data.items); 
    this._healthnableCoreService.pageInformation.next(dataList.data);
    }
  })
 
}
  

  addKpi() {
    if(this.metricForm.valid){
       const rawValue = this.metricForm.value;
    const transformedEntry: metricData = {
      ...rawValue,
      unit: rawValue.unit?.name || '',
      frequency: rawValue.frequency?.name || '',
      source: rawValue.source?.name || '',
      applicableDash: rawValue.applicableDash?.name || '',
    };
    this.dataList.push(transformedEntry);
    this._healthnableCoreService.tableData.next(this.dataList);
    this.metricForm.reset();
    }
   
  }

  reset() {
    this.metricForm.reset();
  }
   deleteMetric(action: string, obj: any) {
        let dialogRef = this.dialog.open(DeleteKpiComponent, {
          data: {obj,
            tags:this.tags,
            dependencies:this.dep
             },
             width: '450px' ,
             disableClose: true
        });
        dialogRef.afterClosed().subscribe((res: any) => {
          if (res === 'cancel' || !res) {
          
           }else{
          this.metricList(this.pageIndex,this.pageSize)
        }
         
        });
      }
      logicBuilder(){
         const selectedDataset = this.metricForm.get('source')?.value;

  if (selectedDataset && selectedDataset.name) {

    const encodedDataset = encodeURIComponent(selectedDataset.name);
    this.router.navigate(['dashboards/dashboard-metric/logic-builder', encodedDataset]);
  } 
 
      }
       onKPINameChange(event: any): void {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, ''); 
    inputValue = inputValue.replace(/[^a-zA-Z'\- ]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.metricForm.get('kpiName')?.setValue(inputValue, { emitEvent: false });
  }
  getUnits(){
    this.dashService.getUnits().subscribe({
      next:(data:any)=>{
this.unitValue=data.data.map((item: any) => item);
      }
    })
  }
    getFrequencies(){
    this.dashService.getFreq().subscribe({
      next:(data:any)=>{
this.freqValue=data.data.map((item: any) => item);
      }
    })
  }
  getDatasets(){
     this.dashService.getSourceDataset().subscribe({
      next:(data:any)=>{
this.datasetValue=data.data.map((item: any) => item);
      }
    })
  }
    ngOnDestroy() {
    if (this.paginationDataSubscription) {
      this.paginationDataSubscription.unsubscribe();
    }
    if (this.gridEditOptionSubscription) {
      this.gridEditOptionSubscription.unsubscribe();
    }
  }
}
