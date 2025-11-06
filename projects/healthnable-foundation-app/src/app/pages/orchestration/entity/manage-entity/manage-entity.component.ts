import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../../material/material.module';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TableComponent } from '../../../../core-components/table/table.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';

@Component({
  selector: 'app-manage-entity',
  standalone: true,
  imports: [TranslateModule, MaterialModule, SelectComponent, TableComponent, HeaderComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './manage-entity.component.html',
  styleUrl: './manage-entity.component.scss'
})
export class ManageEntityComponent implements OnInit {
  form!: FormGroup
  locationValue = [

    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
  ]
  constructor(private fb: FormBuilder) { }
  displayedColumns = [ 'relatedEntity', 'type', 'action']
  ngOnInit() {
    this.form = this.fb.group({
      primaryEntity: ['', [Validators.required]],

      secEntity: ['', [Validators.required]],
      relType: ['', [Validators.required]]
    })
  }




}
