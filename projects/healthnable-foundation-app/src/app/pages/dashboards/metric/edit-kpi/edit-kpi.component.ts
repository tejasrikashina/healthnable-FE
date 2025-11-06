import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from '../../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { metricData } from '../../../../type-models/dashboard';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TableComponent } from '../../../../core-components/table/table.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { DashboardService } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-edit-kpi',
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
  templateUrl: './edit-kpi.component.html',
  styleUrl: './edit-kpi.component.scss'
})
export class EditKpiComponent implements OnInit{
    gridRemoveOptionSubscription!: Subscription;
    gridEditOptionSubscription!: Subscription;
  paginationDataSubscription!:Subscription;
kpiCode:any
   pageSize:number = 5;
  pageIndex:number = 1;
    tags:any
  dep:boolean=true
  constructor(
    private fb: FormBuilder,
    private _healthnableCoreService: HealthnableCoreService,
    private dialog:MatDialog,
      private dashService:DashboardService,
    private router:Router,
        private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {  
    translate.get('kpi').subscribe((tags: string) => { this.tags = tags });
    this.activatedRoute.params.subscribe((param: any) => {
      this.kpiCode = param['kpiCode'];
    
    });
  }
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
  unitValue = [
    { name: 'Minutes' },
    { name: 'Hours' },
    { name: 'Count' },
    { name: 'Ratio' },
    { name: 'Percentage' },
  ];
  freqValue = [
    { name: 'Real-Time' },
    { name: 'Hourly' },
    { name: 'Daily' },
    { name: 'Weekly' }
  ];
  datasetValue = [
    { name: 'ED Dataset' },
    { name: 'ICU Tracker' },
    { name: 'OR Logs' }
  ];
  appDashValue = [
    { name: 'Emergency Department' },
    { name: 'Excecutivre Summary' }
  ];
  ngOnInit() {
     this.metricForm = this.fb.group({
 kpiName: ['' ,[Validators.minLength(3),
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

  reset() {
    this.metricForm.reset();
  }
   deleteMetric(action: string, obj: any) {
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
      logicBuilder(){
        this.router.navigate(['dashboards/dashboard-metric/logic-builder'])
      }
       onKPINameChange(event: any): void {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, ''); 
    inputValue = inputValue.replace(/[^a-zA-Z'\- ]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.metricForm.get('kpiName')?.setValue(inputValue, { emitEvent: false });
  }
}
