import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';

@Component({
  selector: 'app-add-attribute',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderComponent,
    TranslateModule,
    InputComponent,
    SelectComponent,
    TextAreaComponent,
    PrimeNGModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-attribute.component.html',
  styleUrl: './add-attribute.component.scss',
})
export class AddAttributeComponent implements OnInit {
  form!: FormGroup;
  locationValue = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];

  constructor(private router: Router, private translate:TranslateService,private fb: FormBuilder) {
  }
  ngOnInit() {
    this.form = this.fb.group({
      name: [''],
      // code: [''],
      description: [''],
      categories: [''],
      subcategories:[''],
      datatype: [''],
      fieldtype:[''],
      fieldSpec:[''],
      defaultValue: [''],
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
}
