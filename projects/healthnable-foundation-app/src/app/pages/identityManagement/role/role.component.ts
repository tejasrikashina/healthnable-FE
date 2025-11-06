import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TableComponent } from '../../../core-components/table/table.component';
import { MaterialModule } from '../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { Router } from '@angular/router';
import { PrimeNGModule } from '../../../material/primeng.module';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { Subscription } from 'rxjs';
import { DeleteRoleComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { CommonModule } from '@angular/common';
import { IdentityManagementService } from '../../../services/identity-management.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'healthnable-role',
  standalone: true,
  imports: [
    TableComponent,
    MaterialModule,
    TranslateModule,
    CommonModule,
    HeaderComponent,
    PrimeNGModule,
    FormsModule,
    TieredMenuModule,
  ],
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss',
})
export class RoleComponent implements OnInit , OnDestroy {
  isCardVisible: boolean = false;
  isRoleActive: boolean = false;
  pageSize: number = 5;
  pageIndex: number = 1;
  allRoleItems: any[] = [];
  searchStatusText: string = '';
  selectedStatus: Set<string> = new Set();
  currentCategory: string = '';
  searchRole: string = '';
  roleType = [
    { label: 'System', selected: false },
    { label: 'Custom', selected: false },
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  filteredStatus: any[] = this.status;
  @ViewChild('cardContainer', { static: false }) cardContainer!: ElementRef;
  displayedColumns: string[] = [
    'role_name',
    'user_count',
    'status',
    'bothaction',
  ];
  items: MenuItem[] | undefined;
  tags: any;
  dep: boolean = true;
  paginationDataSubscription!:Subscription
  gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
  gridViewOptionSubscription!: Subscription;
  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private _identityService: IdentityManagementService,
    private router: Router,
    private _healthnableCoreService: HealthnableCoreService
  ) {
    translate.get('roles').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
  addRole() {
    this.router.navigate(['/identity/roles/add-role']);
  }
  ngOnInit() {
 this.getRolesList(this.pageIndex, this.pageSize);
    this.paginationDataSubscription =
      this._healthnableCoreService.paginationData.subscribe((res) => {
        if (res.tableName === 'roles') {
          this.getRolesList(res.pageIndex, res.pageSize);
        }
      });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'roles') {
          this.router.navigate(['/identity/roles/edit-role']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'roles') {
          this.deleteRole('Delete', { data: res.data });
        }
      });
  }
  tableLength!: number;

  onSearch() {
    const searchValue = this.searchRole?.trim();

    this._identityService
      .searchByName(searchValue)
      .subscribe({
        next: (data: any) => {
          if (data.data.items.length > 0) {
            this.tableLength = data.data.items.length;
            this._healthnableCoreService.tableData.next(data.data.items);
            this._healthnableCoreService.pageInformation.next(data.data);
          } else {
            this._healthnableCoreService.apiError('No Data Found');
            this._healthnableCoreService.tableData.next(data.data.items);
            this._healthnableCoreService.pageInformation.next(data.data);
          }
        },
      });
  }
  inputClearValue() {
    if (this.searchRole == '') {
      this.getRolesList(this.pageIndex, this.pageSize);
    }
  }
  getRolesList(pageIndex: number, pageSize: number) {
    this._identityService.getAllRoles(pageIndex, pageSize).subscribe({
      next: (dataList: any) => {
        this.allRoleItems = dataList.data.items;
        this._healthnableCoreService.tableData.next(dataList.data.items);
        this._healthnableCoreService.pageInformation.next(dataList.data);
      },
    });
  }

  deleteRole(action: string, obj: any) {
    let dialogRef = this.dialog.open(DeleteRoleComponent, {
      data: { obj, tags: this.tags, dependencies: this.dep },
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res === 'cancel' || !res) {
      } else {
        this.getRolesList(this.pageIndex, this.pageSize);
      }
    });
  }
    resetFilters() {
    this.selectedStatus.clear();
    this.searchStatusText=''
    this.getRolesList(this.pageIndex, this.pageSize);
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
  showRoleDetails(category: string) {
    this.currentCategory = category;
    this.isRoleActive = true;
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
    onStatusCheckboxChange(statusName: string, event: any) {
    if (event.target.checked) {
      this.selectedStatus.add(statusName);

      this._identityService
        .searchByRoleStatus(statusName, this.pageIndex, this.pageSize)
        .subscribe({
          next: (data: any) => {
            if(data.data.total_items>0){
               this.tableLength = data.data.items.length;
            this._healthnableCoreService.tableData.next(data.data.items);
            this._healthnableCoreService.pageInformation.next(data.data);
            }
           else{
              this.tableLength = data.data.items.length;
            this._healthnableCoreService.tableData.next(data.data.items);
            this._healthnableCoreService.pageInformation.next(data.data);
                this._healthnableCoreService.apiError('No data found');
           }
          },
        });
    } else {
      this.selectedStatus.delete(statusName);
      this.getRolesList(this.pageIndex, this.pageSize);
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
