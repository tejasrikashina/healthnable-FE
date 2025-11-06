import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../core-components/input/input.component';
import { CalendarComponent } from '../../../../core-components/calendar/calendar.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preview-template',
  standalone: true,
  imports: [MaterialModule,HeaderComponent,TranslateModule,ReactiveFormsModule,InputComponent,CalendarComponent,SelectComponent,TextAreaComponent],
  templateUrl: './preview-template.component.html',
  styleUrl: './preview-template.component.scss'
})
export class PreviewTemplateComponent implements OnInit{
 form!: FormGroup;
 locationValue = [
  { name: 'Male', code: 'NY' },
  { name: 'Female', code: 'RM' },
];
 constructor(private fb:FormBuilder,private router:Router){}
    ngOnInit(){

     this.form = this.fb.group({

      firstName:[''],
      lastName:[''],
      Dob:[''],
      gender:[''],
      title:[''],
      field1:[''],
      field2:[''],
      field3:[''],
      field4:['']
     });

   }
   onCancel(){
    this.router.navigate(['/orchestration/add-template'])
   }
}
