import { Component } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { TableComponent } from '../../../core-components/table/table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { EditAuditComponent } from './edit-audit/edit-audit.component';
@Component({
  selector: 'app-audit',
  standalone: true,
   imports: [MaterialModule,TableComponent, TranslateModule, HeaderComponent],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent {
  tags:any
  displayedColumns =[ 'eventId','eventtype', 'module', 'time']
    constructor(private dialog:MatDialog,private translate: TranslateService, ){
      translate.get('audit').subscribe((tags: string) => { this.tags = tags });
      }
      deleteAudit(action: string, obj: any) {
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
            addAudit(action:string, obj: any){
              obj.action = action;
              let dialogRef = this.dialog.open(EditAuditComponent, { data: obj , width:'500px',disableClose: true  }
                
              );
              
              dialogRef.afterClosed().subscribe((res: any) => {
          
              });
            }
}
