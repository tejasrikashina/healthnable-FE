import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PageInformation } from '../../interface/healthnable-core.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HealthnableCoreService } from '../healthnable-core.service';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { PrimeNGModule } from '../../material/primeng.module';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'healthnable-table',
  standalone: true,
  imports: [MaterialModule,TranslateModule,NgScrollbarModule,PrimeNGModule,CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit{
  items:MenuItem[] | undefined;
   @Input() dataSourceVal: any[] = [];
  @Input() displayedColumns?: string[];
  @Input() tableName?: string;
  @Input() isPaginationDisabled: boolean = false;
  @Output() dataToParent = new EventEmitter<any>()
  dataSource = new MatTableDataSource<any>();
  pageInformation!: PageInformation;
  tableDataSubscription!:Subscription;
   pageInformationSubscription!:Subscription;
  isDataExist:boolean = false;
  selectedRowIndex!:number;
 pageSize: number = 10;
  @ViewChild('assetElements', { read: MatPaginator }) assetElements!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
 constructor(private translate: TranslateService,private _healthnableCoreService: HealthnableCoreService) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
}
ngOnInit() {
  // Automatically emit the data when the child component is initialized
  this.dataToParent.emit(this.dataSource)

}
ngAfterViewInit() {
  this.tableDataSubscription=
  this._healthnableCoreService.tableData.subscribe((res) => {
    if(res.length>0){
      this.isDataExist = true;
    }
    else{
      this.isDataExist=false
    }
    this.dataSource.data = res;
    this.dataSource.paginator = this.assetElements;
    this.dataSource.sort = this.sort;
    
  });

  this.pageInformationSubscription= this._healthnableCoreService.pageInformation.subscribe((res) => {
    this.pageInformation = res;
  });
  }
  ngOnDestroy() {
        this.pageInformationSubscription.unsubscribe();
    this.tableDataSubscription.unsubscribe();
  }
  viewItem(item:any,index:number){
this._healthnableCoreService.gridViewOption.next({data: item, tableName: this.tableName,index});
  }
onPaginateChange(e:any){
  this._healthnableCoreService.paginationData.next(
    {"pageIndex": e.pageIndex + 1, "pageSize": e.pageSize, "tableName": this.tableName}
  );
}
removeItem(item:any): void{
  this._healthnableCoreService.gridRemoveOption.next({data: item, tableName: this.tableName});
}
copy(item:any){
  this._healthnableCoreService.gridCopyOption.next({data: item, tableName: this.tableName});
}
editItem(item:any): void{
  this._healthnableCoreService.gridEditOption.next({data: item, tableName: this.tableName});
}
}

