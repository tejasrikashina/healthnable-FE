import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-arrange-layout',
  standalone: true,
  imports: [MaterialModule, TranslateModule, PrimeNGModule, CommonModule],
  templateUrl: './arrange-layout.component.html',
  styleUrl: './arrange-layout.component.scss',
})
export class ArrangeLayoutComponent {
  constructor(public dialogRef: MatDialogRef<ArrangeLayoutComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
      this.cards = data.cards || [];
  }
  onCancel() {
    this.dialogRef.close();
  }
  cards = [
    { header:'', isGraph: false },
  ];

 drop(event: CdkDragDrop<any[]>) {
  moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
}

saveLayout() {
  this.dialogRef.close(this.cards); 
}
}
