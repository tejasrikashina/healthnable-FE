import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { Router } from '@angular/router';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';

@Component({
  selector: 'app-edit-category',
  standalone: true,
   imports: [InputComponent,MaterialModule,TextAreaComponent,ReactiveFormsModule,FormsModule,TranslateModule,PrimeNGModule,StatusComponent,HeaderComponent],
  templateUrl: './edit-category.component.html',
  styleUrl: './edit-category.component.scss'
})
export class EditCategoryComponent implements OnInit{
   status!:boolean;
    local_data: any;
    form!:FormGroup
     constructor( private fb:FormBuilder,private translate: TranslateService, private router:Router){}
    locationValue=[
     
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    
    ]
      ngOnInit() {
        this.form = this.fb.group({
          // code:[''],
          categoryname: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
          description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
          status: [true],
        });
      }
      onCancel(){
        this.router.navigate(['/metadata/categories'])
      }
  onStatusChange(): void {
    this.status = this.form.get('status')?.value;
  }
}
