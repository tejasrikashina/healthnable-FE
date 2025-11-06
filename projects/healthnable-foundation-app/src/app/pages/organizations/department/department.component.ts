import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { ViewDepartmentComponent } from './view-department/view-department.component';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-department',
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
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss',
})
export class DepartmentComponent implements OnInit, OnDestroy {
  isCardVisible: boolean = false;
  isRoleActive: boolean = false;
  currentCategory: string = '';
  searchDepartment: string = '';
  searchDepText: string = '';
  searchStatusText: string = '';
  filteredDepValue: any[] = [];
  depValue!: any[];
  selectedDepartments: Set<string> = new Set();
  selectedStatus: Set<string> = new Set();
  pageSize: number = 5;
  pageIndex: number = 1;
  filteredData: any;
  paginationDataSubscription!: Subscription;
  gridViewOptionSubscription!: Subscription;
  gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
  alldepItems: any[] = [];
  @ViewChild('cardContainer', { static: false }) cardContainer!: ElementRef;
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  filteredStatus: any[] = this.status;
  tags: any;
  displayedColumns = [
    'department_code',
    'department_name',
    'status',
    'bothaction',
  ];
  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService,
    private router: Router,
    private _orgService: OrganizationService
  ) {
    translate.get('department').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
  ngOnInit() {
    this.getDepValue();
    this.getDepartments(this.pageIndex, this.pageSize);
    this.gridViewOptionSubscription =
      this._healthnableCoreService.gridViewOption.subscribe((res) => {
        if (res.tableName === 'department') {
          this.viewDepartment();
        }
      });
    this.paginationDataSubscription =
      this._healthnableCoreService.paginationData.subscribe((res) => {
        if (res.tableName === 'department') {
          this.getDepartments(res.pageIndex, res.pageSize);
        }
      });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'department') {
          this.router.navigate(['organizations/organization/edit-department']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'department') {
          this.deleteDepartment('Delete', { data: res.data });
        }
      });
  }
  selectedCategory: string = '';
  onClick(category: string) {
    this.selectedCategory = category;
  }
  showdepartmentDetails(category: string) {
    this.currentCategory = category;
    this.isRoleActive = true;
  }
  deleteDepartment(action: string, obj: any) {
    obj.action = action;
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { obj, tags: this.tags },
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res === 'cancel' || !res) {
      } else {
        this.getDepartments(this.pageIndex, this.pageSize);
      }
    });
  }

  getDepartments(pageIndex: number, pageSize: number) {
    this._orgService.getDepartment(pageIndex, pageSize).subscribe({
      next: (dataList: any) => {
        this.alldepItems = dataList.data.items;
        this._healthnableCoreService.tableData.next(dataList.data.items);
        this._healthnableCoreService.pageInformation.next(dataList.data);
      },
    });
  }
  toggleCardVisibility() {
    this.isCardVisible = !this.isCardVisible;
    if (!this.isCardVisible) {
      this.isRoleActive = false;
      this.currentCategory = '';
    }
  }

  onSearch() {}
  adddepartment() {
    this.router.navigate(['organizations/organization/add-department']);
  }

  viewDepartment() {
    let dialogRef = this.dialog.open(ViewDepartmentComponent, {
      maxWidth: '600px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {});
  }
  onDepSearchChange(searchText: string) {
    this.searchDepText = searchText;
    if (searchText.trim() === '') {
      this.filteredDepValue = this.depValue.slice(0, 5);
    } else {
      this.filteredDepValue = this.depValue.filter((item) =>
        item.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  }
  onstatusSearchChange(searchText: string) {
    this.searchStatusText = searchText;
    if (searchText.trim() === '') {
      this.filteredStatus = this.status;
    } else {
      this.filteredStatus = this.status.filter((item) =>
        item.label.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.filter-toggle')) {
      return;
    }
    if (
      this.isCardVisible &&
      this.cardContainer &&
      !this.cardContainer.nativeElement.contains(target)
    ) {
      this.isCardVisible = false;
      this.isRoleActive = false;
      this.currentCategory = '';
    }
  }
  resetFilters() {
    this.selectedDepartments.clear();
    this.searchDepText = '';
    this.searchStatusText=''
    this.selectedStatus.clear()
    this.filteredDepValue = this.depValue.slice(0, 5);
    this.getDepartments(this.pageIndex, this.pageSize);
  }
  getDepValue() {
    this._orgService.getDepNames().subscribe({
      next: (data: any) => {
        this.depValue = data.data;
        this.filteredDepValue = this.depValue.slice(0, 5);
      },
    });
  }
  tableLength!: number;

  onDepCheckboxChange(depName: string, event: any) {
    if (event.target.checked) {
      this.selectedDepartments.add(depName);

      this._orgService
        .searchByCountry(depName, this.pageIndex, this.pageSize)
        .subscribe({
          next: (data: any) => {
            this.tableLength = data.data.items.length;
            this._healthnableCoreService.tableData.next(data.data.items);
            this._healthnableCoreService.pageInformation.next(data.data);
          },
        });
    } else {
      this.selectedDepartments.delete(depName);
      this.getDepartments(this.pageIndex, this.pageSize);
    }
  }
  inputClearValue() {
    if (this.searchDepartment == '') {
      this.getDepartments(this.pageIndex, this.pageSize);
    }
  }
  onStatusCheckboxChange(statusName: string, event: any) {
    if (event.target.checked) {
      this.selectedStatus.add(statusName);

      this._orgService
        .searchByDepStatus(statusName, this.pageIndex, this.pageSize)
        .subscribe({
          next: (data: any) => {
            if(data.data.total_items >0){
            this._healthnableCoreService.tableData.next(data.data.items);
            this._healthnableCoreService.pageInformation.next(data.data);
            }
           else{
            this._healthnableCoreService.tableData.next(data.data.items);
            this._healthnableCoreService.pageInformation.next(data.data);
                this._healthnableCoreService.apiError('No data found');
           }
          },
        });
    } else {
      this.selectedStatus.delete(statusName);
      this.getDepartments(this.pageIndex, this.pageSize);
    }
  }
    ngOnDestroy() {
    if (this.paginationDataSubscription) {
      this.paginationDataSubscription.unsubscribe();
    }
    if (this.gridEditOptionSubscription) {
      this.gridEditOptionSubscription.unsubscribe();
    }
    if (this.gridViewOptionSubscription) {
      this.gridViewOptionSubscription.unsubscribe();
    }
    if (this.gridRemoveOptionSubscription) {
      this.gridRemoveOptionSubscription.unsubscribe();
    }
  }
}
