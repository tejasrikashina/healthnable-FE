import { Component } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { AddModuleComponent } from './add-module/add-module.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-module-architecture',
  standalone: true,
   imports: [MaterialModule,TableComponent, HeaderComponent, TranslateModule],
  templateUrl: './module-architecture.component.html',
  styleUrl: './module-architecture.component.scss'
})
export class ModuleArchitectureComponent {
  displayedColumns =[ 'name','description','status','version','createdDate']
  constructor(private dialog:MatDialog){}
 addModule(action:string,obj:any){
      obj.action = action; 
      let dialogRef = this.dialog.open(AddModuleComponent, { 
        data: obj, 
        width:'500px' ,
        disableClose: true
      });
        dialogRef.afterClosed().subscribe((res: any) => {
             
      });
    }
}
