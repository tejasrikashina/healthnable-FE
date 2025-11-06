import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../../material/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../../core-components/input/input.component';
import { PrimeNGModule } from '../../../../../material/primeng.module';

@Component({
  selector: 'app-edit-assigned-attr',
  standalone: true,
  imports: [MaterialModule,TranslateModule,InputComponent,ReactiveFormsModule,PrimeNGModule],
  templateUrl: './edit-assigned-attr.component.html',
  styleUrl: './edit-assigned-attr.component.scss'
})
export class EditAssignedAttrComponent implements OnInit{
    form!: FormGroup;
    selectedCheckboxes: string[] = [];
    reactiveKeywords: string[] = [];
  constructor(public dialogRef: MatDialogRef<EditAssignedAttrComponent>, private fb:FormBuilder){}
  ngOnInit(){
      
      this.form = this.fb.group({
        sectionName:[''],
        addAttribute : this.fb.group({
          isAttribute: [false],
          isfirstName: [false],
          isfirstDelDate: [false],
          eduDetails: [false],
          isDob:[false]
        })
        })
     
    }
    onCheckboxChange(label: string, isChecked: boolean) {
      if (isChecked) {
        this.selectedCheckboxes.push(label);
      
      } else {
        const index = this.selectedCheckboxes.indexOf(label);
        if (index > -1) {
          this.selectedCheckboxes.splice(index, 1);
        }
      }
    }
    addChips() {
      this.reactiveKeywords = [...this.selectedCheckboxes];
    
    }
    onReset() {
      this.form.get('addAttribute')?.reset();
    }
  onCancel()
  {
    this.dialogRef.close();
  
  }
}
