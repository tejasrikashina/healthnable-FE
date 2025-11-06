import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { CardModule } from 'primeng/card';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';
import { PrimeNGModule } from '../../../material/primeng.module';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { ViewFloorComponent } from './view-floor/view-floor.component';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-floor',
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
  templateUrl: './floor.component.html',
  styleUrl: './floor.component.scss'
})
export class FloorComponent implements OnInit{
  constructor(  private translate: TranslateService,
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService,
    private router: Router){
    translate.get('floor').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
   isCardVisible: boolean = false;
  isRoleActive: boolean = false;
  currentCategory: string = '';
  searchSpeciality: string = '';
  filteredData: any;
  gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
  gridViewOptionSubscription!:Subscription
  facility = [
    { label: 'Mercy Gen', selected: false },
  ];
  functionalType=[
  { label: 'Clinical', selected: false },
    { label: 'Surgical', selected: false },
    { label: 'Admin', selected: false },
    { label: 'Mixed', selected: false },
  ]
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  tags: any;
  displayedColumns = [
    'floor_code',
    'floor_name',
   'facility',
   'floor_level',
   'status',
    'bothaction'
  ];
    ngOnInit() {
    this.floorList();
    this.gridViewOptionSubscription =
    this._healthnableCoreService.gridViewOption.subscribe((res) => {
      if (res.tableName === 'floor') {
        this.viewFloor();
      }
    });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'floor') {
          this.router.navigate(['infrastructure/floor/edit-floor']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'floor') {
          this.deleteFloor('Delete', { data: res.data });
        }
      });
  }
    dataList = [
    {
      floor_code: 'CCU-3F',
      floor_name: '3rd Floor-ICU',
      facility:'Mercy Gen',
      floor_level:'3',
      status: 'Active',
    },
    {
    floor_code: 'MAT-2F',
      floor_name: '2nd Floor-Maternity',
      facility:'Mercy Gen',
      floor_level:'2',
      status: 'Inactive',
    },
  ];
    showFloorDetails(category: string) {
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
    floorList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
    deleteFloor(action: string, obj: any) {
      obj.action = action;
      let dialogRef = this.dialog.open(DeleteDialogComponent, {
        data: { obj, tags: this.tags },
        width: '450px',
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((res: any) => {});
    }
    viewFloor() {
      let dialogRef = this.dialog.open(ViewFloorComponent, {
        maxWidth: '800px',
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((res: any) => {
      this.floorList()
      });
    }
    addFloor(){
       this.router.navigate(['infrastructure/floor/add-floor']);
    }
}
