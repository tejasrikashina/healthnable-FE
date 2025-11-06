import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputComponent } from '../../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../../core-components/select/select.component';
import { HeaderComponent } from '../../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../../material/material.module';
import { PrimeNGModule } from '../../../../../material/primeng.module';
import { Router } from '@angular/router';
import { TextAreaComponent } from '../../../../../core-components/text-area/text-area.component';
import { StatusComponent } from '../../../../../core-components/status/status.component';

@Component({
  selector: 'app-copy-attribute',
  standalone: true,
  imports: [
    MaterialModule,
    TextAreaComponent,
    HeaderComponent,
    TranslateModule,
    InputComponent,
    SelectComponent,
    StatusComponent,
    PrimeNGModule,
    ReactiveFormsModule,
  ],
  templateUrl: './copy-attribute.component.html',
  styleUrl: './copy-attribute.component.scss'
})
export class CopyAttributeComponent implements OnInit{
  constructor(private router: Router, private translate:TranslateService,private fb: FormBuilder){}
  form!: FormGroup;
  status!:boolean;
  locationValue = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];
  ngOnInit() {
    this.form = this.fb.group({
      name: [''],
      // code: [''],
      description: [''],
      categories: [''],
      subcategories:[''],
      status: [''],
      defaultValue: [''],
      datatype:[''],
      minVal: [''],
      maxVal: [''],
      regexPattern: [''],
      allowedValues: [''],
      inputType: [''],
      checkboxes:[''],
      isMandatory: [false],
      isEditable: [false],
      isSearchable: [false],
      visibilityRules: [''],
      validationRules: [''],
      dependencyRules: [''],
      conditionLogic: [''],
      administrator: [''],
      isAudit: [false],
      apiField: [''],
      dbColumn: [''],
      isIndex: [false],
    });
  }
  onCancel() {
   this.router.navigate(['/orchestration/attribute'])
}
onStatusChange(): void {
  this.status = this.form.get('status')?.value;
}
}
