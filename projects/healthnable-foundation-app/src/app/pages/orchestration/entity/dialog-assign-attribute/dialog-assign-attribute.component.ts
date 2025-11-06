import { Component } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog-assign-attribute',
  standalone: true,
  imports: [MaterialModule,TranslateModule],
  templateUrl: './dialog-assign-attribute.component.html',
  styleUrl: './dialog-assign-attribute.component.scss'
})
export class DialogAssignAttributeComponent {
  constructor(public dialogRef: MatDialogRef<DialogAssignAttributeComponent>){}
  onCancel()
  {
    this.dialogRef.close();
  
  }
}
