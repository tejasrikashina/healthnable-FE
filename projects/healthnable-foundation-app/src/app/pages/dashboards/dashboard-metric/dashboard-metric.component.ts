import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { SelectComponent } from '../../../core-components/select/select.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DrilldownPreviewComponent } from './drilldown-preview/drilldown-preview.component';
import { MatDialog } from '@angular/material/dialog';
import { InputComponent } from '../../../core-components/input/input.component';
import { PrimeNGModule } from '../../../material/primeng.module';
import { TableComponent } from '../../../core-components/table/table.component';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { Subscription } from 'rxjs';
import { metricDrilldownData } from '../../../type-models/dashboard';
import { Router } from '@angular/router';

@Component({
  selector: 'healthnable-dashboard-metric',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderComponent,
    TranslateModule,
    SelectComponent,
    ReactiveFormsModule,
    InputComponent,
    PrimeNGModule,
    TableComponent,
  ],
  templateUrl: './dashboard-metric.component.html',
  styleUrl: './dashboard-metric.component.scss',
})
export class DashboardMetricComponent implements OnInit {
  metricDrillForm!: FormGroup;
  displayedColumns: string[] = [
    'metricName',
    'mappedScreen',
    'objType',
    'navigation',
    'bothaction'
  ];

  drilldownSetup: any[] = [
    { name: 'Open in Modal', key: 'M' },
    { name: 'Open in New Tab ', key: 'T' },
  ];
  dashboardValue = [
    { name: 'Outpatient Flow' },
    { name: 'Inpatient Flow' },
    { name: 'Bed occupancy & availability' },
    { name: 'Workforce Management' },
    { name: 'Revenue Cycle & Financial' },
  ];
  metricValue = [
    { name: 'Patient Waiting > 30 mins' },
    { name: 'No-Show Rate' },
    { name: 'Average Consultation Time' },
    { name: 'OPD Complaints Logged Today' },
  ];
  mappedScreen = [
    { name: 'Delayed Admissions List' },
    { name: 'Patient Appoitment List' },
  ];
  headers: string[] = [
    'Metric Name',
    'Mapped to Screen',
    'Target Object',
    'Filter Condition',
    'Navigation Type',
  ];
  rows: { [key: string]: string }[] = [
    {
      'Metric Name': 'No-Show Rate',
      'Mapped to Screen':
        'Patient Appointment List (Filtered by No-Show = True)',
      'Target Object': 'Appointment',
      'Filter Condition': 'Status = No-Show',
      'Navigation Type': 'Open in New Tab',
    },
  ];
  paginationDataSubscription!: Subscription;
  gridEditOptionSubscription!:Subscription
  constructor(
    private fb: FormBuilder,
    private router:Router,
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService
  ) {}
  ngOnInit() {
    this.kpiDrilldownList();
    this.metricDrillForm = this.fb.group({
      dashboard: ['',[Validators.required]],
      metric: ['',[Validators.required]],
      mappedScreen: ['',[Validators.required]],
      objType: ['Admission',[Validators.required]],
      selectedDrilldown: ['Open in Modal'],
    });
    this.paginationDataSubscription =
      this._healthnableCoreService.paginationData.subscribe((res) => {
        if (res.tableName === 'metricDrilldown') {
          this.kpiDrilldownList();
        }
      });
          this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'metricDrilldown') {
        this.router.navigate(['/dashboards/dashboard/edit-metric']);
      }
    });
  }
  previewMapping() {
    let dialogRef = this.dialog.open(DrilldownPreviewComponent, {
      maxWidth: '800px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {});
  }
  clear() {
    this.metricDrillForm.reset();
  }
  dataList = [
    {
      metricName: 'No-Show Rate',
      mappedScreen: 'Patient Appointment List',
      objType: 'Appointment',
      navigation: 'Open in Tab',
    },
    {
      metricName: 'Delayed Admission Cases',
      mappedScreen: 'Delayed Admission List',
      objType: 'Admission',
      navigation: 'Open in Modal',
    },
  ];

  addMapping() {
    const rawValue = this.metricDrillForm.value;
    const transformedEntry: metricDrilldownData = {
      metricName: rawValue.metric?.name || '',
      mappedScreen: rawValue.mappedScreen?.name || '',
      objType: rawValue.objType?.name || '',
      navigation: rawValue.selectedDrilldown || '',
    };
    this.dataList.push(transformedEntry);
    this._healthnableCoreService.tableData.next(this.dataList);
    this.metricDrillForm.reset();
  }

  kpiDrilldownList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
}
