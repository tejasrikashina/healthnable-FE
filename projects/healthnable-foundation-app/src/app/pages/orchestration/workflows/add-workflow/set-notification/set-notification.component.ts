import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectComponent } from '../../../../../core-components/select/select.component';
import { InputComponent } from '../../../../../core-components/input/input.component';
import { TextAreaComponent } from '../../../../../core-components/text-area/text-area.component';
import { HeaderComponent } from '../../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../../material/material.module';

@Component({
  selector: 'app-set-notification',
  standalone: true,
  imports: [SelectComponent,InputComponent,TextAreaComponent,HeaderComponent,MaterialModule,TranslateModule,ReactiveFormsModule],
  templateUrl: './set-notification.component.html',
  styleUrl: './set-notification.component.scss'
})
export class SetNotificationComponent implements OnInit{
      form!:FormGroup
    constructor(private translate:TranslateService, private fb:FormBuilder, private router:Router){}
    locationValue = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ];
    ngOnInit(){
    this.form=this.fb.group({
      trigger:[''],
      notify:[''],
      recipient:[''],
      via:[''],
      stage:[''],
      notifyCompilance:[''],
      compilanceManager:[''],
      viaApp:[''],
      task:[''],
      assignedUser:[''],
      name:[''],
      message:[''],
    })
  }
  onCancel(){
    this.router.navigate(['/orchestration/add-workflow'] )
  }
  previous(){
    this.router.navigate(['/orchestration/set-workflow'] )
  }
  preview(){
    this.router.navigate(['/orchestration/preview-workflow'] )
  }
}
