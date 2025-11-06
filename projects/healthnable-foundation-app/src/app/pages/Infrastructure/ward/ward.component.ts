import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { CardModule } from 'primeng/card';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';
import { PrimeNGModule } from '../../../material/primeng.module';
import { ViewWardComponent } from './view-ward/view-ward.component';

@Component({
  selector: 'app-ward',
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
  templateUrl: './ward.component.html',
  styleUrl: './ward.component.scss'
})
export class WardComponent implements OnInit{
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
    'ward_code',
    'ward_name',
   'facility',
   'floor',
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
    translate.get('ward').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
      ngOnInit() {
    this.wardList();
    this.gridViewOptionSubscription =
    this._healthnableCoreService.gridViewOption.subscribe((res) => {
      if (res.tableName === 'ward') {
        this.viewWard();
      }
    });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'ward') {
          this.router.navigate(['infrastructure/ward/edit-ward']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'ward') {
          this.deleteward('Delete', { data: res.data });
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
      ward_code: 'ward-301-A',
      ward_name: 'ward A',
      facility:'Mercy Gen',
      floor:'ICU East',
     
      status: 'Active',
    },
    {
    ward_code: 'ward-301-B',
      ward_name: 'ward B',
      facility:'Mercy Gen',
     floor:'ICU East',
     
      status: 'Inactive',
    },
  ];
  wardList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
  addWard(){
 this.router.navigate(['infrastructure/ward/add-ward']);
  }
    viewWard() {
        let dialogRef = this.dialog.open(ViewWardComponent, {
          maxWidth: '800px',
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((res: any) => {
        });
      }
   deleteward(action: string, obj: any) {
        obj.action = action;
        let dialogRef = this.dialog.open(DeleteDialogComponent, {
          data: { obj, tags: this.tags },
          width: '450px',
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((res: any) => {});
      }
}
