import { Component, OnInit } from '@angular/core';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TableComponent } from '../../../../core-components/table/table.component';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import {DeleteattributetemplateComponent } from '../../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { EditAttributeComponent } from '../edit-attribute/edit-attribute.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';

@Component({
  selector: 'app-attrtocategories',
  standalone: true,
  imports: [SelectComponent,TableComponent,MaterialModule,TranslateModule, HeaderComponent],
  templateUrl: './attrtocategories.component.html',
  styleUrl: './attrtocategories.component.scss'
})
export class AttrtocategoriesComponent implements OnInit{
  displayedColumns=['attributeName','mandatory','defaultvalue','validation']
  form!:FormGroup
  locationValue=[
   
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }

]
  constructor(private fb:FormBuilder,private dialog:MatDialog){}
  ngOnInit(){
this.form=this.fb.group({

category:['']
})
  }
   deleteAttr(action: string, obj: any) {
        obj.action = action; 
        let dialogRef = this.dialog.open(DeleteattributetemplateComponent, { 
          data: obj, 
          width: '450px' ,
          disableClose: true
        });
          dialogRef.afterClosed().subscribe((res: any) => {
               
        });
    
      }
      addAttr(action:string,obj:any){
        obj.action = action; 
        let dialogRef = this.dialog.open(EditAttributeComponent, { 
          data: obj, 
          maxWidth:'750px' ,
          disableClose: true
        });
          dialogRef.afterClosed().subscribe((res: any) => {
               
        });
      }
}
