import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../../material/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { SelectComponent } from '../../../../../core-components/select/select.component';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../../core-components/input/input.component';
import { OnlyNumbersDirective } from '../../../../../directives/only-numbers.directive';
import { Router } from '@angular/router';
import { DashboardService } from '../../../../../services/dashboard.service';

@Component({
  selector: 'app-add-operand',
  standalone: true,
  imports: [MaterialModule,TranslateModule,SelectComponent,ReactiveFormsModule,InputComponent,OnlyNumbersDirective],
  templateUrl: './add-operand.component.html',
  styleUrl: './add-operand.component.scss'
})
export class AddOperandComponent implements OnInit{
  constructor(public dialogRef:MatDialogRef<AddOperandComponent>,private fb:FormBuilder,private dashService:DashboardService,
    private router:Router){}
    addOpForm!:FormGroup
    operandType=[
{ name: 'Count' },
  { name: 'Average (Avg)' },
  { name: 'Sum' },
  { name: 'Min' },
  { name: 'Max' },
  { name: 'Custom' },
  { name: 'Constant' },
  { name: 'Distinct Count' },
  { name: 'Median' },
  { name: 'Mode' },
  { name: 'Percentile (N)' },
  { name: 'Ratio' },
  { name: 'Rate per X' },
  { name: 'Boolean Match' },
  { name: 'Z-Score' }

    ]
      dataset=[
    { name: 'ED Dataset' },
    { name: 'ICU Tracker' },
    { name: 'OR Logs' }

    ]
      fieldValue!:any[]
    operator!:any[]
value=[
  {name:'True'},
  {name:'False'}
]
operand=[
  {name:'discharge_time'},
  {name:'admission_time'}
]
    ngOnInit() {
      this.getOperators()
      this.getFields()
      this.getdatasetNames()
      this.addOpForm=  this.fb.group({
        operandType:['', [Validators.required]],
        dataset:[''],
        field:[''],
  conditions: this.fb.array([]),
        value1:[''],
        operand:[''],
        operand1:[''],
          field1: [''],
      operator: [''],
      value: ['']
      })
      
 this.addOpForm.get('operandType')?.valueChanges.subscribe((val) => {
      console.log('Operand Type changed to:', val);
    });

  }

onCancel(){
   this.dialogRef.close();
}
saveOperand(){
   this.dialogRef.close();
}
reset(){
   this.addOpForm.reset({
    operandType: null,
    dataset: null,
    field: null,
    field1: null,
    operator: null,
    value: null,
    value1: null,
    operand: null,
    operand1: null,
  });
}
  createCondition(): FormGroup {
    return this.fb.group({
      field1: [''],
      operator: [''],
      value: ['']
    });
  }
   get conditionsFormArray(): FormArray {
  return this.addOpForm.get('conditions') as FormArray;
}
getConditionGroup(index: number): FormGroup {
  return this.conditionsFormArray.at(index) as FormGroup;
}
  addCondition(): void {
  

    this.conditionsFormArray.push(this.createCondition());
    
  }
    removeCondition(index: number): void {
    this.conditionsFormArray.removeAt(index);
  }
getOperators(){
     this.dashService.getAllOperator().subscribe({
      next:(data:any)=>{
this.operator=data.data.map((item: any) => item);
      }
    })
  }
   getFields(){
         this.dashService.getAllFields().subscribe({
      next:(data:any)=>{
this.fieldValue=data.data
}
    })
  }
  getdatasetNames(){
    this.dashService.getdatasetNames().subscribe({
      next:(data)=>{
        this.dataset=data.data
      }
    })
  }
}
