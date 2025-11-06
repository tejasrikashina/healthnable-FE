import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../../material/material.module';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TableComponent } from '../../../../core-components/table/table.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateWorkflowComponent } from '../create-workflow/create-workflow.component';

@Component({
  selector: 'app-entity-workflow',
  standalone: true,
  imports: [
    TableComponent,
    SelectComponent,
    TranslateModule,
    MaterialModule,
    HeaderComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './entity-workflow.component.html',
  styleUrl: './entity-workflow.component.scss',
})
export class EntityWorkflowComponent implements OnInit{
  form!: FormGroup;
  constructor(private fb: FormBuilder, private dialog: MatDialog) {}
  displayedColumns = [ 'workflow', 'assignedentity', 'currentStage'];
  displayedColumns2 = [
    'select',
    'entityId',
    'name',
    'type',
    'workflow',
    'status',
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
      entityType: [''],
      workflow: [''],
    });
  }
  workflow(action: string, obj: any) {
    obj.action = action;
    let dialogRef = this.dialog.open(CreateWorkflowComponent, {
      data: obj,
      maxWidth: '800px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((res: any) => {});
  }
}
