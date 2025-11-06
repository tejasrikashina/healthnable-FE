import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SelectComponent } from '../../../../../core-components/select/select.component';
import { MaterialModule } from '../../../../../material/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from '../../../../../services/dashboard.service';

@Component({
  selector: 'app-add-filter',
  standalone: true,
  imports: [MaterialModule,TranslateModule,SelectComponent,ReactiveFormsModule],
  templateUrl: './add-filter.component.html',
  styleUrl: './add-filter.component.scss'
})
export class AddFilterComponent {
  constructor(public dialogRef:MatDialogRef<AddFilterComponent>,private fb:FormBuilder, private dashService:DashboardService){}
      addfilterForm!:FormGroup
       fieldVal=[]
    operatorVal=[]
value=[
  {name:'True'},
  {name:'False'}
]
 ngOnInit() {
  this.getFields()
  this.getOperators()
      this.addfilterForm=  this.fb.group({     
        field:[''],   
        operator:[''],
        
  filters: this.fb.array([]),
        value:[''],
      })
    }
onCancel(){
   this.dialogRef.close();
}
reset(){
  this.addfilterForm.reset()
}
saveFilter(){
   this.dialogRef.close();
}
  createFilter(): FormGroup {
    return this.fb.group({
       field:[''],   
        operator:[''],
        value:[''],
    });
  }
     get filterFormArray(): FormArray {
    return this.addfilterForm.get('filters') as FormArray;
  }
  getFilterGroup(index: number): FormGroup {
  return this.filterFormArray.at(index) as FormGroup;
}
addFilter(){
   this.filterFormArray.push(this.createFilter());
}
removeFilter(index:number){
   this.filterFormArray.removeAt(index);
}
  getFields(){
         this.dashService.getAllFields().subscribe({
      next:(data:any)=>{
this.fieldVal=data.data
}
    })
  }
   getOperators(){
         this.dashService.getfilterOperators().subscribe({
      next:(data:any)=>{
this.operatorVal=data.data
}
    })
  }
}
