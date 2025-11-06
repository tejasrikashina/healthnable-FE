import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { MatDialogRef } from '@angular/material/dialog';
import { FeatherModule } from 'angular-feather';

@Component({
  selector: 'app-templated-dependency',
  standalone: true,
  imports: [MaterialModule,ReactiveFormsModule, TranslateModule,SelectComponent, FeatherModule],
  templateUrl: './templated-dependency.component.html',
  styleUrl: './templated-dependency.component.scss'
})
export class TemplatedDependencyComponent implements OnInit{
  tags:any
  form!:FormGroup
constructor(private translate:TranslateService, private dialogRef:MatDialogRef<TemplatedDependencyComponent>, private fb:FormBuilder){
  translate.get('attributes').subscribe((tags:string)=>this.tags=tags)
}
headers: any = ["Template Name","Description", "Attributes Count"]
ngOnInit(){
this.form=this.fb.group({
  selectTemplate:['']
})
}
onCancel()
{
  this.dialogRef.close();

}
}
