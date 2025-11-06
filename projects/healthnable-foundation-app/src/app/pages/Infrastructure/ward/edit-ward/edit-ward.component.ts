import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';

@Component({
  selector: 'app-edit-ward',
  standalone: true,
imports: [HeaderComponent,MaterialModule,StatusComponent,PrimeNGModule,
    ReactiveFormsModule,TranslateModule,InputComponent,SelectComponent,TextAreaComponent],
  templateUrl: './edit-ward.component.html',
  styleUrl: './edit-ward.component.scss'
})
export class EditWardComponent {
addWardForm!:FormGroup
subSpec: any[] = [
  { name: 'Yes', key: 'Y' },
  { name: 'No', key: 'N' }
];
status!: boolean;
constructor(private fb:FormBuilder,private _healthnableCoreService:HealthnableCoreService,private router:Router){}
    locationValue = [
    { name: 'New York'},
    { name: 'Rome' },
    { name: 'London' },
    { name: 'Istanbul' },
    { name: 'Paris' }
  ];
  ngOnInit(){
     this.addWardForm=this.fb.group({
      ward_name:['',[Validators.required]],
      cleaning:['',[Validators.required]],
      ward_type:[''],
      hvac:[''],
      speciality:[''],
      facility:['',[Validators.required]],
      floor:[''],
      emergencyExit:['',[Validators.required]],
      fireSafety:['Yes'],
      isDependency:['Yes'],
      rtls:[''],
      description:[''],
      nurseStation:[''],
      bedCapacity:['',[Validators.required]],
      status:[true]

     }) 
  }
       onStatusChange(): void {
    this.status = this.addWardForm.get('status')?.value;
  }
  onCancel(){
    this.router.navigate(['infrastructure/ward'])
  }
}
