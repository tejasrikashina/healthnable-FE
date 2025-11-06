import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../../../../core-components/table/table.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../../material/material.module';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChangeWorkflowComponent } from '../change-workflow/change-workflow.component';

@Component({
  selector: 'app-entitystatus',
  standalone: true,
  imports: [TableComponent,SelectComponent,TranslateModule,MaterialModule,HeaderComponent,ReactiveFormsModule,FormsModule],
  templateUrl: './entitystatus.component.html',
  styleUrl: './entitystatus.component.scss'
})
export class EntitystatusComponent implements OnInit{
form!:FormGroup
constructor(private fb:FormBuilder, private dialog:MatDialog){}
displayedColumns=['type','totalentity','active','inactive','pending']
displayedColumns2=['entityId','name','type','status']
locationValue=[
   
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' }
]
ngOnInit(){
this.form= this.fb.group({
  entityType:[''],
status:['']
})
}
 
export(action:string,obj:any){
  let dialogRef=this.dialog.open(ChangeWorkflowComponent,{data:obj, maxWidth:'750px',disableClose:true})
  dialogRef.afterClosed().subscribe((res: any) => {

  });
}
}
