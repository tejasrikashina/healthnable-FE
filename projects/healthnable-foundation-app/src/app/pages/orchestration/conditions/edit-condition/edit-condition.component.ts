import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';

@Component({
  selector: 'app-edit-condition',
  standalone: true,
  imports: [InputComponent,SelectComponent,PrimeNGModule,HeaderComponent,MaterialModule,ReactiveFormsModule,TranslateModule,StatusComponent],
  templateUrl: './edit-condition.component.html',
  styleUrl: './edit-condition.component.scss'
})
export class EditConditionComponent implements OnInit{
constructor(private router: Router, private fb: FormBuilder) {}
  form!: FormGroup;
  status!:boolean;
  categories: any[] = [
    { name: 'Vaidation', key: 'A' },
    { name: 'Restriction', key: 'M' },
    { name: 'Auto Action', key: 'R' },

  ];
  operators:any[]=[
    { name: 'AND', key: 'A' },
    { name: 'OR', key: 'M' },
  ]
  locationValue = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];
    ngOnInit() {
      this.form = this.fb.group({
        conditionName: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(25),
          ]),
        ],
        selectedCondition: [''],
        attribute:[''],
        operator:[''],
        value:[''],
        additionalAttr:[''],
        additionalOperator:[''],
        additionalVal:[''],
        actionType:[''],
        target:[''],
        notification: [true]

    
      });
    }
    onCancel() {
      this.router.navigate(['/orchestration/conditions']);
    }
    onStatusChange(): void {
      this.status = this.form.get('notification')?.value;
    }
}
