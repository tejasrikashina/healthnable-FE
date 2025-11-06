import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../core-components/input/input.component';
import { SelectComponent } from '../../../core-components/select/select.component';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { StatusComponent } from '../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../core-components/text-area/text-area.component';
import { TableComponent } from '../../../core-components/table/table.component';
import { drilldownData } from '../../../type-models/dashboard';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { PrimeNGModule } from '../../../material/primeng.module';
import { MatDialog } from '@angular/material/dialog';
import { FieldMappingComponent } from './field-mapping/field-mapping.component';

@Component({
  selector: 'app-drilldown-setup',
  standalone: true,
  imports: [MaterialModule,HeaderComponent,TranslateModule,SelectComponent,ReactiveFormsModule,StatusComponent, TextAreaComponent,TableComponent,PrimeNGModule],
  templateUrl: './drilldown-setup.component.html',
  styleUrl: './drilldown-setup.component.scss'
})
export class DrilldownSetupComponent implements OnInit{
  constructor(private fb:FormBuilder, private _healthnableCoreService:HealthnableCoreService,private dialog: MatDialog,
  ){}
drilldownForm!:FormGroup
status!:boolean;
 dataList: drilldownData[] = [];
displayedColumns: string[] = [
  'screenName',
  'screenId',
  'objType',
  'screenType',
  'source',
  'status'
];
screenTypeValue=[
  { name: 'List' },
  {name:'Form'},
  { name: 'Grid'}  , 
   {name:'Tracker'}
]
objTypeValue=[
  { name: 'Patient' },
  {name:'Appointment'},
  { name: 'Bed'}  
]
screenNameValue=[
  { name: 'No-Show Appointment' },
  {name:'ICU Transfer Tracker'} 
]
drilldownSetup: any[] = [
  { name: 'Open in Model', key: 'M' },
  { name: 'Open in New Tab ', key: 'T' },
];
sourceType: any[] = [
  { name: 'Internal', key: 'M' },
  { name: 'External', key: 'T' },
];
show!:boolean
ngOnInit() {
    this.drilldownForm=this.fb.group({
      screenName: [null, [this.objectRequiredValidator]],
  screenType: [null, [this.objectRequiredValidator]],
  objType: [null, [this.objectRequiredValidator]],
   description: ['', [Validators.maxLength(1000)]],
      status:[true],
      selectedDrilldown: ['Open in Model'],
      external:[''],
      source:['Internal']
    })
 
    
    this.dataList = [
      {
        screenName: 'No-Show Appointment',
        screenId: 'NS_APT_SCREEN_001',
        screenType: 'Minutes',
        objType: 'Appointment',
        source:'Internal',
        status: 'Active',
       
      },
      {
        screenName: 'ICU Transfer Tracker',
        screenId: 'ICU_TRACKER_002',
        screenType: 'Bed',
        objType: 'Tracker',
          source:'Internal',
        status: 'Active',
       
      },
    ]
    this.drilldownList();
}
onStatusChange(): void {
  this.status = this.drilldownForm.get('status')?.value;
}
drilldownList() {
  this._healthnableCoreService.tableData.next(this.dataList);
}
saveDrilldown(){
  if(this.drilldownForm.valid){
     const rawValue = this.drilldownForm.value;
      const transformedEntry: drilldownData = {
        ...rawValue,
        screenName: rawValue.screenName?.name || '',
        objType: rawValue.objType?.name || '',
        screenType: rawValue.screenType?.name || '',
      };
      this.dataList.push(transformedEntry);
      this._healthnableCoreService.tableData.next(this.dataList);
      this.drilldownForm.reset();
    }
}
reset(){
  this.drilldownForm.reset({
    status: true,
    selectedDrilldown: 'Open in Model',
    source: 'Internal'
  });
}
 objectRequiredValidator(control: AbstractControl): ValidationErrors | null {
  return control.value && control.value.name ? null : { required: true };
}
addFeildMapping(){
  let dialogRef = this.dialog.open(FieldMappingComponent, {
        maxWidth: '1000px',
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((res: any) => {});
      //   let dialogRef = this.dialog.open(FieldMapping1Component, {
      //   maxWidth: '1000px',
      //   disableClose: true,
      // });
      // dialogRef.afterClosed().subscribe((res: any) => {});
}

}
