import { Component } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { TableComponent } from '../../../core-components/table/table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { AddAccessComponent } from './add-access/add-access.component';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-access-policies',
  standalone: true,
  imports: [MaterialModule,TableComponent, TranslateModule, HeaderComponent],
  templateUrl: './access-policies.component.html',
  styleUrl: './access-policies.component.scss'
})
export class AccessPoliciesComponent {
  tags:any
  displayedColumns =[ 'role','resource', 'action', 'status']
    constructor(private dialog:MatDialog,private translate: TranslateService, ){
      translate.get('policy').subscribe((tags: string) => { this.tags = tags });
    
      }
addRule(action:string, obj: any){
    obj.action = action;
    let dialogRef = this.dialog.open(AddAccessComponent, { data: obj , width:'500px',disableClose: true});
    dialogRef.afterClosed().subscribe((res: any) => {

    });
  }
   deleteRule(action: string, obj: any) {
      obj.action = action; 
      let dialogRef = this.dialog.open(DeleteDialogComponent, { 
        data: {obj,
        tags:this.tags
         },
        width: '450px' ,
        disableClose: true
      });
        dialogRef.afterClosed().subscribe((res: any) => {
             
      });
  
    }
}
