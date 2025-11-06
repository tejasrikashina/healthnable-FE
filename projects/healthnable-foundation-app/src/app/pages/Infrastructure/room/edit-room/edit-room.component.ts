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
  selector: 'app-edit-room',
  standalone: true,
  imports: [HeaderComponent,MaterialModule,StatusComponent,PrimeNGModule,
    ReactiveFormsModule,TranslateModule,InputComponent,SelectComponent,TextAreaComponent],
  templateUrl: './edit-room.component.html',
  styleUrl: './edit-room.component.scss'
})
export class EditRoomComponent {
addRoomForm!:FormGroup
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
     this.addRoomForm=this.fb.group({
        room_name:['',[Validators.required]],
      room_type:['',[Validators.required]],
      gender:[''],
        hvac:[''],
      facility:['',[Validators.required]],
      floor:['',[Validators.required]],
         bedCapacity:[''],
      cleaning:[''],
      fireSafety:['Yes'],
      isPrimaryRoom:['Yes'],
      rtls:[''],
      description:[''],
      room:['',[Validators.required]],
      ward:['',[Validators.required]],
      status:[true]

     }) 
  }
       onStatusChange(): void {
    this.status = this.addRoomForm.get('status')?.value;
  }
  onCancel(){
    this.router.navigate(['infrastructure/room'])
  }
}
