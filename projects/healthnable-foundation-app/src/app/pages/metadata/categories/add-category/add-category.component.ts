import { Component, Inject, OnInit, Optional } from '@angular/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
@Component({
  selector: 'healthnable-addcategory',
  standalone: true,
  imports: [InputComponent,MaterialModule,ReactiveFormsModule,FormsModule,TranslateModule,PrimeNGModule,StatusComponent,HeaderComponent,TextAreaComponent],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.scss'
})
export class AddCategoryComponent implements OnInit {
  action:string
  tags:any;
  actionLanguage;
  obj:any
  status!:boolean;
  local_data: any;
  form!:FormGroup
  locationValue=[
   
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
  
  ]
  constructor( private fb:FormBuilder,private translate: TranslateService, private router:Router,
     @Optional() @Inject(MAT_DIALOG_DATA) public data:any){
    translate.get('addCategory').subscribe((tags: string) => { this.tags = tags });
    this.local_data = { ...data } 
    this.action = this.local_data.action;
     if (this.action === 'Edit') {
      this.actionLanguage = this.tags.update;
    }
    else  if (this.action === 'Delete') {
      this.actionLanguage = this.tags.delete;
    }
  }
  ngOnInit() {
    this.form = this.fb.group({
      // code:[''],
      categoryname: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(25)])],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      status: [true],
    });

      if (history.state) {
        this.action = history.state.action;
        this.obj = history.state.obj;
        if(this.action){
          this.actionLanguage = this.tags.save;
          this.action=this.tags.add
        } 
    }
  }
  onCancel(){
    this.router.navigate(['/metadata/categories'])
  }
  doAction() {
    if (this.action === 'Add') {
   
    } else if (this.action === 'Edit') {
     
    } else if (this.action === 'Delete') {
      
    }
  }
  onStatusChange(): void {
    this.status = this.form.get('status')?.value;
  }
}
