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
import { DeleteOrgComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { ViewOrganizationComponent } from './view-organization/view-organization.component';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-organization',
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
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss',
})
export class OrganizationComponent implements OnInit, OnDestroy {
  isCardVisible: boolean = false;
  isRoleActive: boolean = false;
  currentCategory: string = '';
  searchOrganization: string = '';
  filteredData: any;
  searchStatusText: string = '';
  countryValue!: any[];
  stateValue!: any[];
  cityValue!: any[];
  filteredCountryValue: any[] = [];
  filteredStateValue: any[] = [];
  filteredCityValue: any[] = [];
  tags: any;
  searchCountrytext: string = '';
  searchStatetext: string = '';
  searchCitytext: string = '';
  dep: boolean = false;
  pageSize: number = 5;
  pageIndex: number = 1;
  paginationDataSubscription!: Subscription;
  gridViewOptionSubscription!: Subscription;
  gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
  selectedCountries: Set<string> = new Set();
  selectedStates: Set<string> = new Set();
  selectedCities: Set<string> = new Set();
  selectedStatuses: Set<string> = new Set();
  allOrgItems: any[] = [];
  displayedColumns = [
    'organization_code',
    'organization_name',
    'city',
    'state',
    'country',
    'status',
    'bothaction',
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  filteredStatus: any[] = this.status;
  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService,
    private router: Router,
    private _orgService: OrganizationService
  ) {
    translate.get('organization').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
  @ViewChild('cardContainer', { static: false }) cardContainer!: ElementRef;
  ngOnInit() {
    this.getCountryValue();
    this.getStateValue();
    this.getCityValue();
    this.getOrgData(this.pageIndex, this.pageSize);
    this.gridViewOptionSubscription =
      this._healthnableCoreService.gridViewOption.subscribe((res) => {
        if (res.tableName === 'organization') {
          this.viewOrg(res);
        }
      });
    this.paginationDataSubscription =
      this._healthnableCoreService.paginationData.subscribe((res) => {
        if (res.tableName === 'organization') {
          this.getOrgData(res.pageIndex, res.pageSize);
        }
      });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'organization') {
          this.router.navigate([
            `organizations/organization/edit-organization/${res.data.organization_code}`,
          ]);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'organization') {
          this.deleteOrg('Delete', { data: res.data });
        }
      });
  }
  addOrg() {
    this.router.navigate(['organizations/organization/add-organization']);
  }
  inputClearValue() {
    if (this.searchOrganization == '') {
      this.getOrgData(this.pageIndex, this.pageSize);
    }
  }
  getOrgData(pageIndex: number, pageSize: number) {
    this._orgService.getAllOrganizations(pageIndex, pageSize).subscribe({
      next: (dataList: any) => {
        this.allOrgItems = dataList.data.items;
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
  selectedCategory: string = '';
  onClick(category: string) {
    this.selectedCategory = category;
  }
  showOrgDetails(category: string) {
    this.currentCategory = category;
    this.isRoleActive = true;
  }

  deleteOrg(action: string, obj: any) {
    let dialogRef = this.dialog.open(DeleteOrgComponent, {
      data: { obj, tags: this.tags, dependencies: this.dep },
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res === 'cancel' || !res) {
      } else {
        this.getOrgData(this.pageIndex, this.pageSize);
      }
    });
  }
  viewOrg(data: any) {
    let dialogRef = this.dialog.open(ViewOrganizationComponent, {
      data: data.data,
      maxWidth: '600px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {
    });
  }

  onCountrySearchChange(searchText: string) {
    this.searchCountrytext = searchText;
    if (searchText.trim() === '') {
      this.filteredCountryValue = this.countryValue.slice(0, 5);
    } else {
      this.filteredCountryValue = this.countryValue.filter((item) =>
        item.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  }

  onStateSearchChange(searchText: string) {
    this.searchStatetext = searchText;
    if (searchText.trim() === '') {
      this.filteredStateValue = this.stateValue.slice(0, 5);
    } else {
      this.filteredStateValue = this.stateValue.filter((item) =>
        item.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  }
  onCitySearchChange(searchText: string) {
    this.searchCitytext = searchText;
    if (searchText.trim() === '') {
      this.filteredCityValue = this.cityValue.slice(0, 5);
    } else {
      this.filteredCityValue = this.cityValue.filter((item) =>
        item.toLowerCase().includes(searchText.toLowerCase())
      );
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
  tableLength!: number;
  countryName: string = '';
  onCountryCheckboxChange(countryName: string, event: any) {
    if (event.target.checked) {
      this.selectedCountries.add(countryName);
      this.countryName = countryName;
      this.filterbyall();
    } else {
      this.selectedCountries.delete(countryName);
      this.countryName=''
      this.filterbyall();
    }
  }
  cityName: string = '';
  onCityCheckboxChange(cityName: string, event: any) {
    if (event.target.checked) {
      this.selectedCities.add(cityName);
      this.cityName = cityName;
      this.filterbyall();
    } else {
      this.selectedCities.delete(cityName);
      this.cityName=''
      this.filterbyall();
      // this.getOrgData(this.pageIndex, this.pageSize);
    }
  }
  stateName: string = '';
  onStateCheckboxChange(stateName: string, event: any) {
    if (event.target.checked) {
      this.selectedStates.add(stateName);
      this.stateName = stateName;
      this.filterbyall();
    } else {
      this.selectedStates.delete(stateName);
 this.stateName=''
      this.filterbyall();
    }
  }
  filterbyall() {
    const searchValue = this.searchOrganization?.trim();
    this._orgService
      .filterByAll(
        searchValue,
        this.countryName,
        this.stateName,
        this.cityName,
        this.statusNam,
        this.pageIndex,
        this.pageSize
      )
      .subscribe({
        next: (data: any) => {
          if (data.total > 0) {
            this.tableLength = data.total_items;
            this._healthnableCoreService.tableData.next(data.items);
            this._healthnableCoreService.pageInformation.next(data);
          } else {
            this._healthnableCoreService.apiError('No Data Found');
            this._healthnableCoreService.tableData.next(data.items);
            this._healthnableCoreService.pageInformation.next(data);
          }
        },
      });
  }
  onSearch() {
    const searchValue = this.searchOrganization?.trim();

    this._orgService
      .searchByOrgName(searchValue, this.pageIndex, this.pageSize)
      .subscribe({
        next: (data: any) => {
          if (data.data.total > 0) {
            this.tableLength = data.data.total_items;
            this._healthnableCoreService.tableData.next(data.data.items);
            this._healthnableCoreService.pageInformation.next(data);
          } else {
            this._orgService
              .searchByCode(searchValue, this.pageIndex, this.pageSize)
              .subscribe({
                next: (data: any) => {
                  if (data.total > 0) {
                    this.tableLength = data.total_items;
                    this._healthnableCoreService.tableData.next(data.items);
                    this._healthnableCoreService.pageInformation.next(data);
                  } else {
                    this._healthnableCoreService.apiError('No Data Found');
                    this._healthnableCoreService.tableData.next(data.items);
                    this._healthnableCoreService.pageInformation.next(data);
                  }
                },
              });
          }
        },
      });
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
    this.selectedCountries.clear();
    this.selectedStates.clear();
    this.selectedCities.clear();
    this.selectedStatuses.clear();
    this.searchStatetext = '';
    this.searchCountrytext = '';
    this.searchCitytext = '';
    this.searchStatusText = '';
    this.filteredCountryValue = this.countryValue.slice(0, 5);
    this.filteredStateValue = this.stateValue.slice(0, 5);
    this.filteredCityValue = this.cityValue.slice(0, 5);
    this.getOrgData(this.pageIndex, this.pageSize);
  }

  getCountryValue() {
    this._orgService.getOrgFilterCountries().subscribe({
      next: (data: any) => {
        this.countryValue = data.countries;
        this.filteredCountryValue = this.countryValue.slice(0, 5);
      },
    });
  }
  getStateValue() {
    this._orgService.getOrgFilterStates().subscribe({
      next: (data: any) => {
        this.stateValue = data.states;
        this.filteredStateValue = this.stateValue.slice(0, 5);
      },
    });
  }
  getCityValue() {
    this._orgService.getOrgFilterCities().subscribe({
      next: (data: any) => {
        this.cityValue = data.cities;
        this.filteredCityValue = this.cityValue.slice(0, 5);
      },
    });
  }
  statusNam: string = '';
  onStatusCheckboxChange(statusName: string, event: any) {
    if (event.target.checked) {
      this.selectedStatuses.add(statusName);
      this.statusNam = statusName;
      this.filterbyall()
    } else {
      this.selectedStatuses.delete(statusName);
        this.statusNam = '';
      this.filterbyall()
      // this.getOrgData(this.pageIndex, this.pageSize);
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
