import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule,FormGroup,Validators, FormBuilder } from '@angular/forms';
import { InputComponent } from '../../../../core-components/input/input.component';
import { StatusComponent } from '../../../../core-components/status/status.component';

@Component({
  selector: 'app-delete-category',
  standalone: true,
  imports: [MaterialModule, TranslateModule],
  templateUrl: './delete-category.component.html',
  styleUrl: './delete-category.component.scss'
})
export class DeleteCategoryComponent {
    tags:any
  constructor(private dialogRef: MatDialogRef<DeleteCategoryComponent>,@Optional() @Inject(MAT_DIALOG_DATA) public data: any){
    this.tags = { ...data.tags }
  }

  onCancel(){
    this.dialogRef.close()
  }
}
