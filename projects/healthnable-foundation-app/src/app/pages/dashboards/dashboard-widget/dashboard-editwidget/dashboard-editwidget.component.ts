import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TableComponent } from '../../../../core-components/table/table.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { widgetData } from '../../../../type-models/dashboard';
import { OnlyNumbersDirective } from '../../../../directives/only-numbers.directive';

@Component({
  selector: 'app-dashboard-editwidget',
  standalone: true,
 imports: [
    MaterialModule,
    HeaderComponent,
    OnlyNumbersDirective,
    StatusComponent,
    TableComponent,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    TranslateModule,
    PrimeNGModule,
  ],
  templateUrl: './dashboard-editwidget.component.html',
  styleUrl: './dashboard-editwidget.component.scss'
})
export class DashboardEditwidgetComponent {
 widgetForm!: FormGroup;
  dataList: widgetData[] = [];
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
  thresholdValue=[
    { name: 'Patients' },
    {name:'mins'},
    { name: 'Complaints'}  , 
  ]
drilldownValue=[
  { name: 'Show list of waiting patients' },
  {name:'Launch Rescheduling SMS'},
  { name: 'Doctor-Wise Time View'}  , 
  {name:'Opens Complaints Table'}
];
datasetValue=[
  { name: 'OPD Dataset' },
  {name:'OPD Visit Dataset'},
  {name:'Complaints Dataset'}
]
  visualizationValue = [
    { name: 'KPI Tile' },
    {name:'Chart'},
    { name: 'Gauge'}
  ];
  colorValue=[
    { name: 'Red' },
    {name:'Blue'},
    { name: 'Yellow'}
  ];
  patientValue=[
    { name: 'Patients' },
    {name:'%'},
    { name: 'mins'},
    { name: 'Complaints'}

  ]
  refreshValue=[
    { name: '5 mins' },
    {name:'10 mins'},
    { name: '15 mins'},
    {name:'20 mins'},
    {name:'25 mins'},
    {name:'30 mins'}
  ]
  displayedColumns: string[] = [
    'kpi',
    'visualizationType',
    'threshold',
    'alertColor',
    'drilldown',
    'mapping',
    'refresh',
    'bothaction',
  ];
  status!:boolean;
  constructor(private fb: FormBuilder,private _healtnableCoreService: HealthnableCoreService) {}
  ngOnInit() {

    this.widgetForm = this.fb.group({
      dashboard: ['', [Validators.required]],
      kpi: ['', [Validators.required]],
    displayName: ['' ,[ Validators.minLength(3),
          Validators.maxLength(70),Validators.pattern(this._healtnableCoreService.regEx.userName)]],
      visualizationType: ['', [Validators.required]],
      threshold: ['', [Validators.required]],
      patients: ['', [Validators.required]],
      alertColor: ['', [Validators.required]],
      drilldown: [''],
      mapping: ['', [Validators.required]],
      refresh: ['', [Validators.required]],
      show: [true],
    });
    this.dataList = [
      {
        dashboard:'' ,
        kpi: 'Patient Waiting > 30 mins',
        displayName: '',
        visualizationType: 'Big KPI',
        threshold: '10 Patients',
        patients: '',
        alertColor:'Red',
        drilldown: 'Show list of waiting patients',
        mapping: 'OPD Dataset',
        refresh: '5 mins',
        show:true,
       
      },
      {
        dashboard:'' ,
        kpi: 'No-Show Rate',
        displayName: '',
        visualizationType:  'Gauge Chart',
        threshold: '20%',
        patients: '',
        alertColor:'Blue',
        drilldown:  'Launch Rescheduling SMS',
        mapping:  'OPD Visit Dataset',
        refresh: '30 mins',
        show:false,
      
      },
    ];
    this.widgetDashboardList()
  }


  onStatusChange(): void {
    this.status = this.widgetForm.get('show')?.value;
  }
  widgetDashboardList(){
    this._healtnableCoreService.tableData.next(this.dataList); 
  }

  addWidget() {
      const rawValue = this.widgetForm.value;
      const transformedEntry: widgetData = {
        ...rawValue,
        kpi : rawValue.kpi?.name || '',
        visualizationType : rawValue.visualizationType?.name || '',
        threshold: `${rawValue.threshold?.name || ''}${rawValue.threshold?.name && rawValue.patients?.name ? ' ' : ''}${rawValue.patients?.name || ''}`,
        alertColor: rawValue.alertColor?.name || '',
        drilldown: rawValue.drilldown?.name || '',
        mapping:rawValue.mapping?.name || '',
        refresh:rawValue.refresh?.name || ''
      };
      this.dataList.push(transformedEntry);
      this._healtnableCoreService.tableData.next(this.dataList);
      this.widgetForm.reset();
    }
       onDisplayNameChange(event: any): void {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, ''); 
    inputValue = inputValue.replace(/[^a-zA-Z'\- ]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.widgetForm.get('displayName')?.setValue(inputValue, { emitEvent: false });
  }
}
