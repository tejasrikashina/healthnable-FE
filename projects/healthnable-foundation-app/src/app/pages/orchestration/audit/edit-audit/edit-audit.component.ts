import { Component, OnInit } from '@angular/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { PrimeNGModule } from '../../../../material/primeng.module';
@Component({
  selector: 'healthnable-edit-audit',
  standalone: true,
  imports: [InputComponent,MaterialModule,ReactiveFormsModule,FormsModule,TranslateModule,PrimeNGModule, SelectComponent],
  templateUrl: './edit-audit.component.html',
  styleUrl: './edit-audit.component.scss'
})
export class EditAuditComponent implements OnInit{
  action: string='Add';
  tags:any
  form!:FormGroup
  locationValue=[
   
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
  
  ]
  constructor( private fb:FormBuilder,private translate: TranslateService,public dialogRef: MatDialogRef<EditAuditComponent>){
    translate.get('addAudit').subscribe((tags: string) => { this.tags = tags });
  }
  ngOnInit() {
    this.form = this.fb.group({
      eventId:['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
      userId: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
      eventType:[''],
      module:[''],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      
    });
   
  }
  onCancel()
{
  this.dialogRef.close();

}
}
