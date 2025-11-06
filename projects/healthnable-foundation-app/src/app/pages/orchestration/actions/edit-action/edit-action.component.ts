import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';

@Component({
  selector: 'app-edit-action',
  standalone: true,
 imports: [InputComponent,SelectComponent,PrimeNGModule,HeaderComponent,MaterialModule,ReactiveFormsModule,TranslateModule,TextAreaComponent],
  templateUrl: './edit-action.component.html',
  styleUrl: './edit-action.component.scss'
})
export class EditActionComponent implements OnInit{
constructor(private router: Router, private fb: FormBuilder) {}
  form!: FormGroup;
  status!:boolean;
  approval:any[]=[
    { name: 'Yes', key: 'A' },
    { name: 'No', key: 'M' },
  ]
  notification:any[]=[
    { name: 'Email', key: 'A' },
    { name: 'SMS', key: 'M' },
    { name: 'In-App Alert', key: 'R' },

  ]
  actions: any[] = [
    { name: 'Notification', key: 'A' },
    { name: 'Data Update', key: 'M' },
    { name: 'Restriction', key: 'R' },

  ];
  locationValue = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];
   ngOnInit() {
      this.form = this.fb.group({
        actionName: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(25),
          ]),
        ],
        selectedAction: [''],
        performAction:[''],
        delay:[''],
        tragetAttr:[''],
        value:[''],
        targetRole:[''],
        selectedNotification:[''],
        selectedApproval:[''],
        customMessage:[''],
        approvalRole:[''],
        escalationPath: ['']

    
      });
    }
    onCancel() {
      this.router.navigate(['/orchestration/actions']);
    }
}
