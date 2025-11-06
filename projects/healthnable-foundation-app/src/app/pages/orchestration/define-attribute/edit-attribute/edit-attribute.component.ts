import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TableComponent } from '../../../../core-components/table/table.component';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { DeleteattributetemplateComponent } from '../../../../components/pop-ups/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-edit-attribute',
  standalone: true,
  imports: [TableComponent, MaterialModule, TranslateModule, InputComponent],
  templateUrl: './edit-attribute.component.html',
  styleUrl: './edit-attribute.component.scss',
})
export class EditAttributeComponent implements OnInit{
  displayedColumns = [
    'select',
    'attributeName',
    'attrType',
    'defaultvalue',
    'validation',
  ];
  form!: FormGroup;
  tags: any;
  constructor(
    private translate: TranslateService,
    private dialogRef: MatDialogRef<EditAttributeComponent>,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    translate.get('entity').subscribe((tags: string) => (this.tags = tags));
  }
  ngOnInit() {
    this.form = this.fb.group({
      templateName: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }
  deleteAttr(action: string, obj: any) {
    obj.action = action;
    let dialogRef = this.dialog.open(DeleteattributetemplateComponent, {
      data: obj,
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {});
  }
  onCancel() {
    this.dialogRef.close();
  }
}
