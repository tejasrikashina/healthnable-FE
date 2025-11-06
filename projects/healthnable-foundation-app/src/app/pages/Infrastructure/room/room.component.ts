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
import { ViewRoomComponent } from './view-room/view-room.component';

@Component({
  selector: 'app-room',
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
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit{
  constructor(  private translate: TranslateService,
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService,
    private router: Router){
    translate.get('room').subscribe((tags: string) => {
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
    'room_code',
    'room_name',
   'facility',
   'floor',
   'ward',
   'status',
    'bothaction'
  ];
    ngOnInit() {
    this.roomList();
    this.gridViewOptionSubscription =
    this._healthnableCoreService.gridViewOption.subscribe((res) => {
      if (res.tableName === 'room') {
        this.viewRoom();
      }
    });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'room') {
          this.router.navigate(['infrastructure/room/edit-room']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'room') {
          this.deleteroom('Delete', { data: res.data });
        }
      });
  }
    dataList = [
    {
      room_code: 'ICU - 301',
      room_name: 'ICU Room - 301',
      facility:'Mercy Gen',
      floor:'3rd Floor',
      ward:'ICU East',
      status: 'Active',
    },
    {
    room_code: 'ICU - 302',
      room_name: '2nd room-Maternity',
      facility:'Mercy Gen',
      floor:'1st Floor',
      ward:'VIP Wing',
      status: 'Inactive',
    },
  ];
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
    roomList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
    deleteroom(action: string, obj: any) {
      obj.action = action;
      let dialogRef = this.dialog.open(DeleteDialogComponent, {
        data: { obj, tags: this.tags },
        width: '450px',
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((res: any) => {});
    }
   viewRoom() {
          let dialogRef = this.dialog.open(ViewRoomComponent, {
            maxWidth: '800px',
            disableClose: true,
          });
          dialogRef.afterClosed().subscribe((res: any) => {
          });
        }
    addRoom(){
       this.router.navigate(['infrastructure/room/add-room']);
    }
}
