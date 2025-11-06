import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { InputComponent } from '../../../../core-components/input/input.component';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';

@Component({
  selector: 'app-add-stage',
  standalone: true,
  imports: [
    HeaderComponent,
    InputComponent,
    TextAreaComponent,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule,
    PrimeNGModule,
    SelectComponent,
  ],
  templateUrl: './add-stage.component.html',
  styleUrl: './add-stage.component.scss',
})
export class AddStageComponent implements OnInit {
  constructor(private router: Router, private fb: FormBuilder) {}
  form!: FormGroup;
  categories: any[] = [
    { name: 'Standard', key: 'A' },
    { name: 'Approval Required', key: 'M' },
  ];
  locationValue = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];
  ngOnInit() {
    this.form = this.fb.group({
      stageName: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(25),
        ]),
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      selectedCategory: ['Standard'],
      previous: [''],
      compilance: [false],
      nonCompilance: [false],
      report: [false],
      documentation: [false],
      verifyCoverage: [false],
      policyDetails: [false],
      copayments: [false],
      deductibles: [false],
      approvalReq: [''],
      approvalTime: [''],
      escalation: [''],
      condition: [''],
      logicBuilder: [''],
      completionRule: [''],
      triggerEvent: [''],
      notify: [''],
      duration: [''],
    });
  }
  onCancel() {
    this.router.navigate(['/orchestration/stages']);
  }
}
