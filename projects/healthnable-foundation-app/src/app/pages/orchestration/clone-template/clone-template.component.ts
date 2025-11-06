import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../core-components/input/input.component';
import { SelectComponent } from '../../../core-components/select/select.component';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TemplatedDependencyComponent } from '../define-attribute/templated-dependency/templated-dependency.component';
import { StatusComponent } from '../../../core-components/status/status.component';
import { PrimeNGModule } from '../../../material/primeng.module';
import { Router } from '@angular/router';
import { TextAreaComponent } from '../../../core-components/text-area/text-area.component';


@Component({
  selector: 'app-clone-template',
  standalone: true,
  imports: [   TableComponent,
      MaterialModule,
      HeaderComponent,
      TranslateModule,
      PrimeNGModule,
      ReactiveFormsModule,
      InputComponent,
      TextAreaComponent,
      StatusComponent,
      SelectComponent,],
  templateUrl: './clone-template.component.html',
  styleUrl: './clone-template.component.scss'
})
export class CloneTemplateComponent implements OnInit{
  constructor(private fb: FormBuilder,private router:Router) {}
  form!: FormGroup;
  displayedColumns=['section', 'attribute','bothaction']
  selectedCheckboxes: string[] = [];
  status!:boolean;
  status1!:boolean;
  reactiveKeywords: string[] = [];
  locationValue = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];

  ngOnInit() {
    this.form = this.fb.group({
      name:[''],
      // code:[''],
      description:[''],
      categories:[''],
      subcategories:[''],
      templateType:[''],
   status:[''],
      section:[''],
      status1:[true],
      addAttribute : this.fb.group({
        isAttribute: [false],
        isfirstName: [false],
        isfirstDelDate: [false],
        eduDetails: [false],
        isDob:[false]
      })
    });
  
  }

  addChips() {
    this.reactiveKeywords = [...this.selectedCheckboxes];
  
  }
  arrangeFields(){
    this.router.navigate(['/orchestration/arrange-fields'])
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
  }
  onReset() {
    this.form.get('addAttribute')?.reset();
  }
 onCancel(){
  this.router.navigate(['/orchestration/template'])
 }
  onStatusChange(): void {
    this.status = this.form.get('status')?.value;
    this.status1 =this.form.get('status1')?.value;
  }
  preview() {
    this.router.navigate(['/orchestration/preview-template'])
  }
}
