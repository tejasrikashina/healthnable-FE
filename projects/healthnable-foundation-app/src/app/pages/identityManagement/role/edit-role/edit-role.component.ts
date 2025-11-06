import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-role',
  standalone: true,
  imports: [InputComponent, MaterialModule, TranslateModule, ReactiveFormsModule, FormsModule,HeaderComponent,SelectComponent,StatusComponent,PrimeNGModule],
  templateUrl: './edit-role.component.html',
  styleUrl: './edit-role.component.scss'
})
export class EditRoleComponent implements OnInit{
 reactiveKeywords: string[] = [];
  selectedCheckboxes: string[] = [];
  form!:FormGroup
  locationValue = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];
  status!:boolean;

constructor( private router:Router, private fb:FormBuilder,private translate: TranslateService,){}
  ngOnInit(){
    this.form = this.fb.group({
      roleName: ['', [Validators.required]],   
      roleType: ['', [Validators.required]], 
      reportTo : ['', [Validators.required]], 
      description: ['', [Validators.required]],   
      status: [true],
      permissions: this.fb.group({
        isCreate: [false],
        isEdit: [false],
        isView: [false],
        isDelete: [false],
      })
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
  }
  onChipRemove(keyword: string) {
    const index = this.selectedCheckboxes.indexOf(keyword);
    if (index > -1) {
      this.selectedCheckboxes.splice(index, 1);
    }
    if (keyword === 'Create') {
      this.form.get('permissions.isCreate')?.reset();
    } else if (keyword === 'Edit') {
      this.form.get('permissions.isEdit')?.reset();
    } else if (keyword === 'View') {
      this.form.get('permissions.isView')?.reset();
    }
    else if (keyword === 'Delete') {
      this.form.get('permissions.isDelete')?.reset();
    }
    this.reactiveKeywords = [...this.selectedCheckboxes];
  }
  onCancel(){
    this.router.navigate(['/identity/roles'])
  }
 onStatusChange(): void {
    this.status = this.form.get('status')?.value;
  }
  chipheader=['Attribute','Template','Entity']
}

