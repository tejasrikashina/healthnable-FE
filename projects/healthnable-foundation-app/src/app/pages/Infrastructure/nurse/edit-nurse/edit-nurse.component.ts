import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { Router } from '@angular/router';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';

@Component({
  selector: 'app-edit-nurse',
  standalone: true,
  imports: [HeaderComponent,MaterialModule,StatusComponent,PrimeNGModule,
    ReactiveFormsModule,TranslateModule,InputComponent,SelectComponent,TextAreaComponent],
  templateUrl: './edit-nurse.component.html',
  styleUrl: './edit-nurse.component.scss'
})
export class EditNurseComponent {
addNurseForm!:FormGroup
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
     this.addNurseForm=this.fb.group({
      nurse_name:['',[Validators.required]],
      rtls:[''],
      facility:['',[Validators.required]],
      hvac:[''],
      floor:[''],
      status:[true],
      servingWards:['',[Validators.required]],   
      isCentral:['Yes'],
      description:[''],
      functionalRole:['']

     }) 
  }
       onStatusChange(): void {
    this.status = this.addNurseForm.get('status')?.value;
  }
  onCancel(){
    this.router.navigate(['infrastructure/nurse'])
  }
}
