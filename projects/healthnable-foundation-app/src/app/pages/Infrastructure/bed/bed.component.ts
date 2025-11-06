import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { CardModule } from 'primeng/card';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';
import { PrimeNGModule } from '../../../material/primeng.module';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { ViewBedComponent } from './view-bed/view-bed.component';

@Component({
  selector: 'app-bed',
  standalone: true,
   imports: [ MaterialModule,
    HeaderComponent,
    TranslateModule,
    CardModule,
    FeatherModule,
    PrimeNGModule,
    FormsModule,
    CommonModule,
    TableComponent],
  templateUrl: './bed.component.html',
  styleUrl: './bed.component.scss'
})
export class BedComponent implements OnInit{
  
 conditionType = [
    { label: 'Validation', selected: false },
    { label: 'Restriction', selected: false },
    { label: 'Auto-Action', selected: false },
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  tags: any;
  displayedColumns = [
    'bed_code',
    'bed_name',
   'facility',
   'ward',
   'room',
   'bedType',
   'status',
    'bothaction'
  ];
     isCardVisible: boolean = false;
  isRoleActive: boolean = false;
  currentCategory: string = '';
  searchSpeciality: string = '';
  filteredData: any;
  gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
  gridViewOptionSubscription!:Subscription
 constructor(  private translate: TranslateService,
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService,
    private router: Router){
    translate.get('bed').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
      ngOnInit() {
    this.bedList();
    this.gridViewOptionSubscription =
    this._healthnableCoreService.gridViewOption.subscribe((res) => {
      if (res.tableName === 'bed') {
        this.viewBed()
      }
    });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'bed') {
          this.router.navigate(['infrastructure/bed/edit-bed']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'bed') {
          this.deleteBed('Delete', { data: res.data });
        }
      });
  }
    showSpecialityDetails(category: string) {
    this.currentCategory = category;
    this.isRoleActive = true;
  }
   toggleCardVisibility() {
    this.isCardVisible = !this.isCardVisible;
    if (!this.isCardVisible) {
      this.isRoleActive = false;
      this.currentCategory = '';
    }
  }
      selectedCategory: string = '';
    onClick(category: string) {
    this.selectedCategory = category;
  }
    dataList = [
    {
      bed_code: 'BED-301-A',
      bed_name: 'Bed A',
      facility:'Mercy Gen',
      ward:'ICU East',
      room:'301',
      bedType:'ICU',
      status: 'Active',
    },
    {
    bed_code: 'BED-301-B',
      bed_name: 'Bed B',
      facility:'Mercy Gen',
     ward:'ICU East',
      room:'302',
      bedType:'ICU',
      status: 'Inactive',
    },
  ];
  bedList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
  addBed(){
 this.router.navigate(['infrastructure/bed/add-bed']);
  }
   viewBed() {
        let dialogRef = this.dialog.open(ViewBedComponent, {
          maxWidth: '800px',
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((res: any) => {
        this.bedList()
        });
      }
   deleteBed(action: string, obj: any) {
        obj.action = action;
        let dialogRef = this.dialog.open(DeleteDialogComponent, {
          data: { obj, tags: this.tags },
          width: '450px',
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((res: any) => {});
      }
}
