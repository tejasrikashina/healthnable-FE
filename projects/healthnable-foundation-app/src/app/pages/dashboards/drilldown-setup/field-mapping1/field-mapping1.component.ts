import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../core-components/input/input.component';
import { CommonModule } from '@angular/common';
import { PrimeNGModule } from '../../../../material/primeng.module';

@Component({
  selector: 'app-field-mapping1',
  standalone: true,
  imports: [MaterialModule,TranslateModule,SelectComponent,CommonModule,ReactiveFormsModule, PrimeNGModule,InputComponent],
  templateUrl: './field-mapping1.component.html',
  styleUrl: './field-mapping1.component.scss'
})
export class FieldMapping1Component implements OnInit {
  constructor(public dialogRef:MatDialogRef<FieldMapping1Component>, private fb:FormBuilder){}
  fieldMapForm!:FormGroup
  dashboardKpi=[
    {'name':'KPI Date'},
    {'name':'KPI Status'},
    {'name':'KPI Location'}
  ]
    screenField=[
    {'name':'Appointment Date'},
    {'name':'Appointment Status'},
    {'name':'Clinics Code'}
  ]
 ngOnInit() {
    this.fieldMapForm = this.fb.group({
      dashboardKpi: [''],
      screenField: [''],
     default: ['', [Validators.minLength(3), Validators.maxLength(70)]],
    items:this.fb.array([])
    });
  }

  
get items():FormArray{
   return this.fieldMapForm.get('items') as FormArray;
}
 addItem() {
  this.items.push(this.fb.group({
    default: ['', [Validators.minLength(3), Validators.maxLength(70)]]
  }));
}
removeItem(index:number){
  this.items.removeAt(index);
}

  onCancel(): void {
    this.dialogRef.close();
  }
}
