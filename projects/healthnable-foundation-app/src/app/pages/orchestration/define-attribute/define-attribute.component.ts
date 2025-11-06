import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../../../core-components/table/table.component';
import { MaterialModule } from '../../../material/material.module';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../core-components/input/input.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeleteattributetemplateComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { EditAttributeComponent } from './edit-attribute/edit-attribute.component';


@Component({
  selector: 'app-define-attribute',
  standalone: true,
  imports: [TableComponent,MaterialModule,HeaderComponent,TranslateModule,InputComponent],
  templateUrl: './define-attribute.component.html',
  styleUrl: './define-attribute.component.scss'
})
export class DefineAttributeComponent implements OnInit {
  displayedColumns=["attributeName","type","defaultvalue","validation"]
  form!:FormGroup
  constructor(private fb:FormBuilder,private dialog:MatDialog){}
  ngOnInit(){
this.form=this.fb.group({
  templateName:['',[Validators.required]],
  description:['',[Validators.required]]

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
    // addAttr(action:string,obj:any){
    //   obj.action = action; 
    //   let dialogRef = this.dialog.open(EditAttributeComponent, { 
    //     data: obj, 
    //     maxWidth:'750px' ,
    //     disableClose: true
    //   });
    //     dialogRef.afterClosed().subscribe((res: any) => {
             
    //   });
    // }
}
