import { Component, input, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { InputComponent } from '../../../core-components/input/input.component';
import { SelectComponent } from '../../../core-components/select/select.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeNGModule } from '../../../material/primeng.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeatherModule } from 'angular-feather';

@Component({
  selector: 'app-import-entity',
  standalone: true,
  imports: [MaterialModule,HeaderComponent, SelectComponent,FeatherModule, TranslateModule,PrimeNGModule,ReactiveFormsModule],
  templateUrl: './import-entity.component.html',
  styleUrl: './import-entity.component.scss'
})
export class ImportEntityComponent implements OnInit{
  form!:FormGroup;
  tags:any
constructor(private translate:TranslateService, private fb:FormBuilder){
  translate.get('uploadFile').subscribe((tags: string) => { this.tags = tags });
}
fileFormat: any[] = [
  { name: 'CSV' },
  { name: 'JSON' },
  { name: 'Excel' },
];
  ngOnInit(){
  this.form=this.fb.group({
  selectFile:['',[Validators.required]],
  fileFormat:['',[Validators.required]],
  entityType:['',[Validators.required]],
  mapping:['',[Validators.required]],
  format:['',[Validators.required]],
  })
  }

}
