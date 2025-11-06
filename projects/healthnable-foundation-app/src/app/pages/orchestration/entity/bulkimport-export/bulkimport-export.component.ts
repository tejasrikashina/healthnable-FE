import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeNGModule } from '../../../../material/primeng.module';
import {FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-bulkimport-export',
  standalone: true,
  imports: [MaterialModule,TranslateModule,PrimeNGModule,ReactiveFormsModule],
  templateUrl: './bulkimport-export.component.html',
  styleUrl: './bulkimport-export.component.scss'
})
export class BulkimportExportComponent implements OnInit{
  bulkImportForm!: FormGroup;
  bulkExportForm!:FormGroup
  constructor(private router:Router,private fb:FormBuilder,public dialogRef: MatDialogRef<BulkimportExportComponent>){}
ngOnInit(){
  this.bulkImportForm=this.fb.group({
    bulkIE: ['Import']
  })
  this.bulkExportForm=this.fb.group({
    entity: [false],
    code: [false],
    category:[false],
    status: [false],
    description:[false]
  })
}
  onCancel(){
   this.dialogRef.close()
  }
}
