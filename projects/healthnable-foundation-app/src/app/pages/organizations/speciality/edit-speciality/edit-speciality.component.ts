import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';

@Component({
  selector: 'app-edit-speciality',
  standalone: true,
 imports: [HeaderComponent, MaterialModule, ReactiveFormsModule,InputComponent, TextAreaComponent,SelectComponent,TranslateModule,StatusComponent, PrimeNGModule],
  templateUrl: './edit-speciality.component.html',
  styleUrl: './edit-speciality.component.scss'
})
export class EditSpecialityComponent implements OnInit{
  constructor(private fb:FormBuilder, private router:Router){}
 form!: FormGroup;
 status!: boolean;
 locationValue = [
  { name: 'Notification' },
  {name:'Form'},
  { name: 'Survey'},
  { name: 'Consent' },
  { name: 'Document' },
  { name: 'Task' },
  { name: 'Campaign' },
];
subSpec: any[] = [
  { name: 'Yes', key: 'Y' },
  { name: 'No', key: 'N' }
];
 ngOnInit() {
     this.form = this.fb.group({
       code:['', [Validators.required]],
      name:['', [Validators.required]],
      type:['', [Validators.required]],
      department:['', [Validators.required]],
      pSpeciality:['',[Validators.required]],
      subSpeciality:['No',[Validators.required]],
      description:['', [Validators.required]],
      status:[true],
     
    }); 
 }
 onStatusChange(): void {
  this.status = this.form.get('status')?.value;
}
onCancel() {
  this.router.navigate(['/organizations/speciality'])
}
}
