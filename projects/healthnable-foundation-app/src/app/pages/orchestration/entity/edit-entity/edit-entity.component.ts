import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogAssignAttributeComponent } from '../dialog-assign-attribute/dialog-assign-attribute.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';

@Component({
  selector: 'app-edit-entity',
  standalone: true,
  imports: [SelectComponent,TextAreaComponent,MaterialModule,StatusComponent, HeaderComponent, TranslateModule,ReactiveFormsModule,InputComponent, PrimeNGModule],
  templateUrl: './edit-entity.component.html',
  styleUrl: './edit-entity.component.scss'
})
export class EditEntityComponent implements OnInit{
 form!:FormGroup
  selectedCheckboxes: string[] = [];
  reactiveKeywords: string[] = [];
  displayedColumns1:any=['attributeName','entityType','defaultvalue','validation']
  displayedColumns=['templatename','description']
constructor( private fb:FormBuilder, private router:Router,private dialog:MatDialog){
  
}
locationValue = [
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' },
];
status!:boolean;
ngOnInit(){
this.form=this.fb.group({
  // entityCode:['',[Validators.required]],
entityName:['',[Validators.required]],
description:['',[Validators.required]],
status:[true],
category:['',[Validators.required]],
subcategory:['',[Validators.required]],
assignAttribute : this.fb.group({
  isAttribute: [false],
  isEmployee: [false],
  isEmployee1: [false],
  isEducation: [false],
  isEducation1: [false],

})
})
}
onCancel()
{
  this.router.navigate(['/orchestration/entity'])
}

   onStatusChange(): void {
    this.status = this.form.get('status')?.value;
  }
  assign(){
     let dialogRef = this.dialog.open(DialogAssignAttributeComponent, { 
      maxWidth:'750px'  ,
            disableClose: true
          });
            dialogRef.afterClosed().subscribe((res: any) => {
                 
          });
  }
  onCheckboxChange(label: string, isChecked: boolean) {
    if (isChecked) {
      this.selectedCheckboxes.push(label);
      this.reactiveKeywords = [...this.selectedCheckboxes];
    } else {
      const index = this.selectedCheckboxes.indexOf(label);
      if (index > -1) {
        this.selectedCheckboxes.splice(index, 1);
      }
    }
    this.reactiveKeywords = [...this.selectedCheckboxes];
  }
  onChipRemove(keyword: string) {
    const index = this.selectedCheckboxes.indexOf(keyword);
    if (index > -1) {
      this.selectedCheckboxes.splice(index, 1);
    }
    if (keyword === 'Attributes') {
      this.form.get('assignAttribute.isAttribute')?.reset();
    } else if (keyword === 'Employee Details') {
      this.form.get('assignAttribute.isEmployee')?.reset();
    } else if (keyword === 'Education Details') {
      this.form.get('assignAttribute.isEducation')?.reset();
    }
    this.reactiveKeywords = [...this.selectedCheckboxes];
  }
  // addChips() {
  //   this.reactiveKeywords = [...this.selectedCheckboxes];
  
  // }
  onReset() {
    this.form.get('assignAttribute')?.reset();
  }
}
