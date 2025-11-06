import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../core-components/input/input.component';
import { MatDialogRef } from '@angular/material/dialog';
import { StatusComponent } from '../../../../core-components/status/status.component';

@Component({
  selector: 'app-add-access',
  standalone: true,
  imports: [TranslateModule,SelectComponent, PrimeNGModule, MaterialModule, StatusComponent,FormsModule, ReactiveFormsModule],
  templateUrl: './add-access.component.html',
  styleUrl: './add-access.component.scss'
})
export class AddAccessComponent implements OnInit {
 action: string='Add';
  tags:any;
  form!:FormGroup
  status!:boolean;
   constructor( private fb:FormBuilder,private translate: TranslateService,public dialogRef: MatDialogRef<AddAccessComponent>){
        translate.get('policy').subscribe((tags: string) => { this.tags = tags });
      }
      
     ngOnInit() {
        this.form = this.fb.group({
          role:['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
          resource: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
          action: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
          status: [true],
        });
       
      }
      locationValue=[
   
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    
    ]
      onCancel()
      {
        this.dialogRef.close();
      
      }
      onStatusChange(): void {
        this.status = this.form.get('status')?.value;
      }
}
