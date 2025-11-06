import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectFileComponent } from '../../../../core-components/select-file/select-file.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TableComponent } from '../../../../core-components/table/table.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { Router } from '@angular/router';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';

@Component({
  selector: 'app-edit-floor',
  standalone: true,
  imports: [HeaderComponent,MaterialModule,StatusComponent,PrimeNGModule,
    ReactiveFormsModule,TranslateModule,InputComponent,SelectComponent,TableComponent,SelectFileComponent,TextAreaComponent],
  templateUrl: './edit-floor.component.html',
  styleUrl: './edit-floor.component.scss'
})
export class EditFloorComponent implements OnInit{
addFloorForm!:FormGroup
subSpec: any[] = [
  { name: 'Yes', key: 'Y' },
  { name: 'No', key: 'N' }
];
status!: boolean;
 displayedColumns=['zoneName','purpose', 'bothaction']
constructor(private fb:FormBuilder,private _healthnableCoreService:HealthnableCoreService,private router:Router){}
    locationValue = [
    { name: 'New York'},
    { name: 'Rome' },
    { name: 'London' },
    { name: 'Istanbul' },
    { name: 'Paris' }
  ];
    FunctionalValue=[
   { name: 'Clinical'},
    { name: 'Surgical' },
    { name: 'Admin' },
    { name: 'Mixed' }
  ]
    FloorLevel=[
   { name: 'Ground'},
    { name: '1' },
    { name: '2' },
    { name: '3' }
  ]
   cleaningValue=[
   { name: 'High-touch'},
    { name: 'Standard' },
    { name: 'Isolation' }
  ]
  ngOnInit(){
    this.addFloorList()
     this.addFloorForm=this.fb.group({
      floor_name:['',[Validators.required]],
      floor_level:['',[Validators.required]],
      functionType:['',[Validators.required]],
      facility:['',[Validators.required]],
      floor_capacity:['',[Validators.required]],
      fireSafety:['Yes'],
      floorMap:[''],
      description:[''],
      emergencyExit:[''],
       icu: [false],
      isolation: [false],
      stepDown: [false],
      status:[true],
      zoneA:[false],
      zoneB:[false],
      cloneForm:[''],
      bmsCode:[''],
      rtls:[''],
      cleaning:['',[Validators.required]],

     }) 
  }
    dataList = [
    {
      zoneName: 'Zone A',
      purpose: 'Post-Surgical Recovery'
    },
    {
    zoneName: 'Zone B',
      purpose:'Adult ICU'
    },
  ];
  addFloorList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
     onStatusChange(): void {
    this.status = this.addFloorForm.get('status')?.value;
  }
  onCancel(){
    this.router.navigate(['infrastructure/floor'])
  }
}
