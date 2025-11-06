import { Component } from '@angular/core';
import { TableComponent } from '../../../../core-components/table/table.component';
import { MaterialModule } from '../../../../material/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-entity-archive',
  standalone: true,
  imports: [TableComponent,MaterialModule,TranslateModule],
  templateUrl: './entity-archive.component.html',
  styleUrl: './entity-archive.component.scss'
})
export class EntityArchiveComponent {
displayedColumns=['name','date']
constructor(private dialogRef:MatDialogRef<EntityArchiveComponent>){}
onCancel()
{
  this.dialogRef.close();

}
}
