import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';
import { PrimeNGModule } from '../../../material/primeng.module';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { ViewSpecialityComponent } from './view-speciality/view-speciality.component';

@Component({
  selector: 'app-speciality',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    HeaderComponent,
    TableComponent,
    FormsModule,
    PrimeNGModule,
    TranslateModule,
  ],
  templateUrl: './speciality.component.html',
  styleUrl: './speciality.component.scss'
})
export class SpecialityComponent {
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
    'specialityCode',
    'specialityName',
   'status',
   'createdOn',
    'bothaction'
  ];
  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService,
    private router: Router
  ) {
    translate.get('speciality').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
  ngOnInit() {
    this.specialityList();
    this.gridViewOptionSubscription =
    this._healthnableCoreService.gridViewOption.subscribe((res) => {
      if (res.tableName === 'speciality') {
        this.viewSpeciality();
      }
    });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'speciality') {
          this.router.navigate(['organizations/organization/edit-speciality']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'speciality') {
          this.deleteSpeciality('Delete', { data: res.data });
        }
      });
  }
  dataList = [
    {
      specialityCode: 'DEPT-CARD',
      specialityName: 'Cardiology',
      status: 'Active',
   createdOn:'2024-10-05'
    },
    {
      specialityCode: 'DEPT-RAD',
      specialityName: 'Radiology',
   status:'InActive',
   createdOn:'2024-10-05'
    },
  ];
  onSearch() {
    if (this.searchSpeciality) {
      this.filteredData = this.dataList.filter((item) =>
        item.specialityName.toLowerCase().includes(this.searchSpeciality.toLowerCase())
      );

      if (this.filteredData.length > 0) {
        this._healthnableCoreService.tableData.next(this.filteredData);
      } else {
        this._healthnableCoreService.tableData.next([]);
      }
    } else {
      this.specialityList();
    }
  }
  addSpeciality() {
    this.router.navigate(['organizations/organization/add-speciality']);
  }
  inputClearValue() {
    if (this.searchSpeciality == '') {
      this.specialityList();
    }
  }
  specialityList() {
    this._healthnableCoreService.tableData.next(this.dataList);
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
  showSpecialityDetails(category: string) {
    this.currentCategory = category;
    this.isRoleActive = true;
  }
  deleteSpeciality(action: string, obj: any) {
    obj.action = action;
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { obj, tags: this.tags },
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {});
  }
  viewSpeciality() {
    let dialogRef = this.dialog.open(ViewSpecialityComponent, {
      maxWidth: '600px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {});
  }
}
