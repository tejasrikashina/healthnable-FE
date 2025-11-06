import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { MaterialModule } from '../../../../material/material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../core-components/input/input.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { Router } from '@angular/router';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';

@Component({
  selector: 'app-add-subcategory',
  standalone: true,
  imports: [TranslateModule,SelectComponent,TextAreaComponent, PrimeNGModule, MaterialModule, FormsModule, ReactiveFormsModule, InputComponent,HeaderComponent,StatusComponent],
  templateUrl: './add-subcategory.component.html',
  styleUrl: './add-subcategory.component.scss'
})
export class AddSubcategoryComponent implements OnInit{
 action: string='Add';
  tags:any;
status!:boolean
  form!:FormGroup
    constructor( private fb:FormBuilder,private translate: TranslateService, private router:Router){
      translate.get('subcategory').subscribe((tags: string) => { this.tags = tags });
    }
   ngOnInit() {
      this.form = this.fb.group({
     
        subCategoryName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
        // subCategoryCode:['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
        description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
        category: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
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
  onCancel(){
    this.router.navigate(['/metadata/subcategories'])
  }
  onStatusChange(): void {
    this.status = this.form.get('status')?.value;
  }
}
