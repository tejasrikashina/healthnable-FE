import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { CardModule } from 'primeng/card';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';
import { PrimeNGModule } from '../../../material/primeng.module';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { ViewNurseStationComponent } from './view-nurse-station/view-nurse-station.component';

@Component({
  selector: 'app-nurse',
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
  templateUrl: './nurse.component.html',
  styleUrl: './nurse.component.scss'
})
export class NurseComponent {
 facility = [
    { label: 'Validation', selected: false },
    { label: 'Restriction', selected: false },
    { label: 'Auto-Action', selected: false },
  ];
   floor = [
    { label: 'Validation', selected: false },
    { label: 'Restriction', selected: false },
    { label: 'Auto-Action', selected: false },
  ];
    ward = [
    { label: 'Validation', selected: false },
    { label: 'Restriction', selected: false },
    { label: 'Auto-Action', selected: false },
  ];
  functionalRole=[
    { label: 'Validation', selected: false },
    { label: 'Restriction', selected: false },
    { label: 'Auto-Action', selected: false },
  ]
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  tags: any;
  displayedColumns = [
    'nurse_code',
    'nurse_name',
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
    translate.get('nurse').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
      ngOnInit() {
    this.nurseList();
    this.gridViewOptionSubscription =
    this._healthnableCoreService.gridViewOption.subscribe((res) => {
      if (res.tableName === 'nurse') {
        this.viewNurseStation();
      }
    });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'nurse') {
          this.router.navigate(['infrastructure/nurse/edit-nurse']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'nurse') {
          this.deletenurse('Delete', { data: res.data });
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
      nurse_code: 'nurse-301-A',
      nurse_name: 'nurse A',
      facility:'Mercy Gen',
      floor:'ICU East',
     
      status: 'Active',
    },
    {
    nurse_code: 'nurse-301-B',
      nurse_name: 'nurse B',
      facility:'Mercy Gen',
     floor:'ICU East',
     
      status: 'Inactive',
    },
  ];
  nurseList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
  addNurse(){
 this.router.navigate(['infrastructure/nurse/add-nurse']);
  }
   deletenurse(action: string, obj: any) {
        obj.action = action;
        let dialogRef = this.dialog.open(DeleteDialogComponent, {
          data: { obj, tags: this.tags },
          width: '450px',
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((res: any) => {});
      }
        viewNurseStation() {
              let dialogRef = this.dialog.open(ViewNurseStationComponent, {
                maxWidth: '800px',
                disableClose: true,
              });
              dialogRef.afterClosed().subscribe((res: any) => {
              });
            }
}
