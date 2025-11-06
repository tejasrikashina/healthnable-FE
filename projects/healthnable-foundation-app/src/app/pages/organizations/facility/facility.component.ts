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
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { Subscription } from 'rxjs';
import { DeleteFacComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { ViewFacilityComponent } from './view-facility/view-facility.component';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-facility',
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
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss',
})
export class FacilityComponent implements OnInit, OnDestroy {
  isCardVisible: boolean = false;
  isRoleActive: boolean = false;
  currentCategory: string = '';
  searchFacility: string = '';
  searchStatusText: string = '';
  pageSize: number = 5;
  pageIndex: number = 1;
  filteredData: any;
  searchFacilityText: string = '';
   selectedFacilities: Set<string> = new Set();  

  selectedStatuses: Set<string> = new Set();
  allFacilityItems: any[] = [];
  @ViewChild('cardContainer', { static: false }) cardContainer!: ElementRef;
  paginationDataSubscription!: Subscription;
  gridViewOptionSubscription!: Subscription;
  gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
  conditionType = [
    { label: 'Validation', selected: false },
    { label: 'Restriction', selected: false },
    { label: 'Auto-Action', selected: false },
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  filteredStatus: any[] = this.status;
  filteredFacilityType: any[] = [];
  facilityValue!: any[];

  tags: any;
  displayedColumns = [
    'facility_code',
    'facility_name',
    'facility_type',
    'city',
    'state',
    'country',
    'status',
    'bothaction',
  ];
  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService,
    private router: Router,
    private _orgService: OrganizationService,
    
  ) {
    translate.get('facility').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
  ngOnInit() {
    this.facilityList(this.pageIndex, this.pageSize);
    this.getFacilityType()
 this.paginationDataSubscription =
      this._healthnableCoreService.paginationData.subscribe((res) => {
        if (res.tableName === 'facility') {
          this.facilityList(res.pageIndex, res.pageSize);
        }
      });
    this.gridViewOptionSubscription =
      this._healthnableCoreService.gridViewOption.subscribe((res) => {
        if (res.tableName === 'facility') {
          this.viewFacility();
        }
      });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'facility') {
          this.router.navigate([
            `organizations/organization/edit-facility/${res.data.facility_code}`,
          ]);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'facility') {
          this.deleteFacility('Delete', { data: res.data });
        }
      });
  }
  selectedCategory: string = '';
  onClick(category: string) {
    this.selectedCategory = category;
  }
  showfacilityDetails(category: string) {
    this.currentCategory = category;
    this.isRoleActive = true;
  }
  deleteFacility(action: string, obj: any) {
    obj.action = action;
    let dialogRef = this.dialog.open(DeleteFacComponent, {
      data: { obj, tags: this.tags },
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res === 'cancel' || !res) {
      } else {
        this.facilityList(this.pageIndex, this.pageSize);
      }
    });
  }
  facilityList(pageIndex: number, pageSize: number) {
    this._orgService.getAllFacilities(pageIndex, pageSize).subscribe({
      next: (dataList: any) => {
        this.allFacilityItems = dataList.data.items;
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

  onSearch() {
    const searchValue = this.searchFacility?.trim();

    this._orgService
      .searchByFacName(searchValue, this.pageIndex, this.pageSize)
      .subscribe({
        next: (data: any) => {
          if (data.data.items.length > 0) {
            this.updateTable(data);
          } else {
            this._orgService
              .searchByFacCountry(searchValue, this.pageIndex, this.pageSize)
              .subscribe({
                next: (countryData: any) => {
                  if (countryData.data.items.length > 0) {
                    this.updateTable(countryData);
                  } else {
                    this._orgService
                      .searchByFacState(
                        searchValue,
                        this.pageIndex,
                        this.pageSize
                      )
                      .subscribe({
                        next: (stateData: any) => {
                          if (stateData.data.items.length > 0) {
                            this.updateTable(stateData);
                          } else {
                            this._healthnableCoreService.apiError(
                              'No Data Found'
                            );
                            this._healthnableCoreService.tableData.next(
                              data.data.items
                            );
                            this._healthnableCoreService.pageInformation.next(
                              data.data
                            );
                          }
                        },
                      });
                  }
                },
              });
          }
        },
      });
  }
  tableLength!: number;

  updateTable(data: any) {
    this.tableLength = data.data.items.length;
    this._healthnableCoreService.tableData.next(data.data.items);
    this._healthnableCoreService.pageInformation.next(data.data);
  }
  addFacility() {
    this.router.navigate(['organizations/organization/add-facility']);
  }
  inputClearValue() {
    if (this.searchFacility == '') {
      this.facilityList(this.pageIndex, this.pageSize);
    }
  }
  resetFilters() {
    this.selectedFacilities.clear();
      this.selectedStatuses.clear();
      this.searchFacilityText = '';
      this.searchStatusText = '';
      this.filteredFacilityType = this.facilityValue.slice(0, 5);
    this.facilityList(this.pageIndex, this.pageSize);
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
      //     this.selectedCategories.clear();
      // this.selectedStatuses.clear();
      // this.searchCategoryText = '';
      // this.searchStatusText = '';
    }
  }

  onStatusSearchChange(searchText: string) {
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
      this.selectedStatuses.add(statusName);

      this._orgService
        .searchByFacStatus(statusName, this.pageIndex, this.pageSize)
        .subscribe({
          next: (data: any) => {
            this.tableLength = data.data.items.length;
            this._healthnableCoreService.tableData.next(data.data.items);
            this._healthnableCoreService.pageInformation.next(data.data);
          },
        });
    } else {
      this.selectedStatuses.delete(statusName);
      this.facilityList(this.pageIndex, this.pageSize);
    }
  }
  onFacilityCheckboxChange(facName: string, event: any) {
  if (event.target.checked) {
    this.selectedFacilities.add(facName);
  } else {
    this.selectedFacilities.delete(facName);
  }
  this.filterTableData();
}
filterTableData() {

    let filtered = this.allFacilityItems;

  if (this.selectedFacilities.size > 0) {
    filtered = filtered.filter(item =>
      this.selectedFacilities.has(item.facility_type)
    );
  }

  if (this.selectedStatuses.size > 0) {
    filtered = filtered.filter(item =>
      this.selectedStatuses.has(item.status)
    );
  }

  if (filtered.length === 0) {
    this._healthnableCoreService.apiError('No data found');
  }

  this._healthnableCoreService.tableData.next(filtered);
   const paginationInfo = {
    total_items: filtered.length,
    page: 1,
    limit: this.pageSize
  };
  this._healthnableCoreService.pageInformation.next(paginationInfo);
}
  viewFacility() {
    let dialogRef = this.dialog.open(ViewFacilityComponent, {
      maxWidth: '600px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {});
  }

    getFacilityType(){
    this._orgService.getFacilityType().subscribe({
      next: (data: any) => {
       this.facilityValue = data.data.facility_types.map((fac: string) => ({ name: fac }));
        this.filteredFacilityType = this.facilityValue.slice(0, 5);
      },
    })
  }
  onFacilitySearchChange(searchText: string) {
    this.searchFacilityText = searchText;
    if (searchText.trim() === '') {
      this.filteredFacilityType = this.facilityValue.slice(0, 5);
    } else {
      this.filteredFacilityType = this.facilityValue.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
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
