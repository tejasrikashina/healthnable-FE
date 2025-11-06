import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { MatDialogRef } from '@angular/material/dialog';
import { StatusComponent } from '../../../../core-components/status/status.component';

@Component({
  selector: 'app-add-module',
  standalone: true,
   imports: [InputComponent,MaterialModule,ReactiveFormsModule,FormsModule,TranslateModule,PrimeNGModule,StatusComponent],
  templateUrl: './add-module.component.html',
  styleUrl: './add-module.component.scss'
})
export class AddModuleComponent implements OnInit{
 action: string='Add';
  tags:any;
  form!:FormGroup
  constructor( private fb:FormBuilder,private translate: TranslateService,public dialogRef: MatDialogRef<AddModuleComponent>){
    translate.get('module').subscribe((tags: string) => { this.tags = tags });
  }
  ngOnInit() {
    this.form = this.fb.group({
      module:['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      version: [],
      status: [true],
    });
   
  }
  onCancel()
{
  this.dialogRef.close();

}
}
