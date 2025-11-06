import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { SelectComponent } from '../../../core-components/select/select.component';
import { FeatherModule } from 'angular-feather';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeNGModule } from '../../../material/primeng.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-export-entity',
  standalone: true,
  imports: [MaterialModule,HeaderComponent, SelectComponent,FeatherModule, TranslateModule,PrimeNGModule,ReactiveFormsModule],
  templateUrl: './export-entity.component.html',
  styleUrl: './export-entity.component.scss'
})
export class ExportEntityComponent implements OnInit {
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
  entityType:['',[Validators.required]],
  fileFormat:['',[Validators.required]],
  filter:['',[Validators.required]],
  })
  }
  
}
