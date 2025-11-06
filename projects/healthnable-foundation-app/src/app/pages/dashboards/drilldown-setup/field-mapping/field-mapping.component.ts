import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
interface KpiMapping {
  kpiField: string;
  screenField: string;
  defaultValue: string;
}
@Component({
  selector: 'app-field-mapping',
  standalone: true,
  imports: [MaterialModule,TranslateModule,CommonModule],
  templateUrl: './field-mapping.component.html',
  styleUrl: './field-mapping.component.scss'
})
export class FieldMappingComponent {
  constructor(public dialogRef:MatDialogRef<FieldMappingComponent>){}
   displayedColumns: string[] = ['kpiField', 'screenField', 'defaultValue', 'icon'];
     dataSource = new MatTableDataSource<KpiMapping>();

  kpiFields = ['Visit ID', 'Patient ID', 'Date', 'Status'];
  screenFields = ['Field A', 'Field B', 'Field C'];
  defaultValues = ['Default A', 'Default B', 'Default C'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
    ngOnInit(): void {
    this.dataSource.data = [
      { kpiField: '', screenField: '', defaultValue: '' },
      { kpiField: '', screenField: '', defaultValue: '' },
      { kpiField: '', screenField: '', defaultValue: '' }
    ];
  }
    deleteRow(index: number): void {
    const data = this.dataSource.data;
    data.splice(index, 1);
    this.dataSource.data = [...data];
  }
onCancel(){
this.dialogRef.close()
}
addField(): void {
  const newRow: KpiMapping = { kpiField: '', screenField: '', defaultValue: '' };
  this.dataSource.data = [...this.dataSource.data, newRow];
}
}
