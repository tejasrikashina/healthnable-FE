import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { FeatherModule } from 'angular-feather';
import { MenuItem } from 'primeng/api';
import { PrimeNGModule } from '../../../material/primeng.module';
import { TableComponent } from '../../../core-components/table/table.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DashboardService } from '../../../services/dashboard.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'healthnable-categories',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderComponent,
    TranslateModule,
    CardModule,
    FeatherModule,
    PrimeNGModule,
    FormsModule,
    CommonModule,
    TableComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dasboard.component.scss',
})
export class DashboardComponent implements OnInit , OnDestroy{
  tags:any
  dep:boolean=false
  dashboardCode:any
  searchdashboardText:string=''
  constructor(private translate: TranslateService,private router:Router,
    private _healthnableCoreService: HealthnableCoreService,private _dashboardService:DashboardService,
    private dialog:MatDialog){
    translate.get('dashboard').subscribe((tags: string) => { this.tags = tags });
  }
  isCardVisible: boolean = false; 
  isRoleActive: boolean = false; 
  paginationDataSubscription!:Subscription;
    gridEditOptionSubscription!: Subscription;
    gridRemoveOptionSubscription!: Subscription;
  currentCategory: string = ''; 
   categoryValue!: any[];
   filteredCategoryValue: any[] = [];
   selectedCategories: Set<string> = new Set();  
   selectedStatuses: Set<string> = new Set();
allDashboardItems: any[] = [];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  filteredStatus: any[] = this.status
  displayedColumns: string[] = ['dashboard_code', 'dashboard_name', 'dashboard_type', 'status','bothaction'];
    pageSize:number = 5;
  pageIndex:number = 1;
  items: MenuItem[] | undefined;
  searchCategoryText: string = '';
  searchStatusText:string=''
   @ViewChild('cardContainer', { static: false }) cardContainer!: ElementRef;
  ngOnInit() {
    this.getdashType()
        this.getDashboardData(this.pageIndex,this.pageSize);
    this.items = [
        {
            label: 'Update',
          
        },
        {
            label: 'Delete',
         
        }
    ];
     this.paginationDataSubscription= this._healthnableCoreService.paginationData.subscribe((res) => {
      if (res.tableName === 'dashboard' || '') {
        this.getDashboardData(res.pageIndex,res.pageSize);
      }
    })
    this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'dashboard') {
        this.router.navigate([`/dashboards/dashboard/edit-dashboard/${res.data.dashboard_code}`]);
      }
    });
    this.gridRemoveOptionSubscription = 
    this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
      if (res.tableName === 'dashboard') {
    
        this.deleteDashboard('Delete', { data: res.data });
      }
    });
}

toggleCardVisibility() {
  this.isCardVisible = !this.isCardVisible; 
  if (!this.isCardVisible) {
    this.isRoleActive = false; 
    this.currentCategory = '';
  }
}
selectedCategory: string = ''
onClick(category: string) {
  this.selectedCategory = category; 
}
showRoleDetails(category: string) {
  this.currentCategory = category; 
  this.isRoleActive = true; 
}
getDashboardData(pageIndex:number, pageSize:number){
  this._dashboardService.getDashboard(pageIndex, pageSize).subscribe({
    next:(dataList:any)=>{
       this.allDashboardItems = dataList.data.items;
 this._healthnableCoreService.tableData.next(dataList.data.items); 
    this._healthnableCoreService.pageInformation.next(dataList.data);
    }
  })
 
}
tableLength!:number
onSearch(){
  this._dashboardService.searchItem(this.searchdashboardText,this.pageIndex, this.pageSize).subscribe({
    next:(data:any)=>{
      this.tableLength=data.data.items.length
this._healthnableCoreService.tableData.next(data.data.items); 
  this._healthnableCoreService.pageInformation.next(data.data);
    }
  })
}
addDashboard(){
  this.router.navigate(['/dashboards/dashboard/add-dashboard'])
}
  deleteDashboard(action: string, obj: any) {
      let dialogRef = this.dialog.open(DeleteDialogComponent, {
        data: {obj,
          tags:this.tags,
          dependencies:this.dep
           },
           width: '450px' ,
           disableClose: true
      });
      dialogRef.afterClosed().subscribe((res: any) => {
        if (res === 'cancel' || !res) {
        
        }else{
          this.getDashboardData(this.pageIndex,this.pageSize)
        }
       
      });
    }
    getdashType(){
this._dashboardService.getDashboardType().subscribe({
  next:(data:any)=>{
this.categoryValue=data.data.map((item: any) => item);
 this.filteredCategoryValue = this.categoryValue.slice(0, 5); 
  }
})
}
onCategorySearchChange(searchText: string) {
  this.searchCategoryText = searchText;
  if (searchText.trim() === '') {
    this.filteredCategoryValue = this.categoryValue.slice(0, 5);
  } else {
    this.filteredCategoryValue = this.categoryValue.filter(item =>
      item.dashboard_type.toLowerCase().includes(searchText.toLowerCase())
    );
  }
}
onStatusSearchChange(searchText: string) {
  this.searchStatusText = searchText;
  if (searchText.trim() === '') {
    this.filteredStatus = this.status
  } else {
    this.filteredStatus = this.status.filter(item =>
      item.label.toLowerCase().includes(searchText.toLowerCase())
    );
  }

}
onCategoryCheckboxChange(categoryName: string, event: any) {
  if (event.target.checked) {
    this.selectedCategories.add(categoryName);
  } else {
    this.selectedCategories.delete(categoryName);
  }
  this.filterTableData();
}
onStatusCheckboxChange(statusLabel: string, event: any) {
  if (event.target.checked) {
    this.selectedStatuses.add(statusLabel);
  } else {
    this.selectedStatuses.delete(statusLabel);
  }
  this.filterTableData();
}
filterTableData() {

    let filtered = this.allDashboardItems;

  if (this.selectedCategories.size > 0) {
    filtered = filtered.filter(item =>
      this.selectedCategories.has(item.dashboard_type)
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
resetFilters() {
  this.selectedCategories.clear();
  this.selectedStatuses.clear();
  this.searchCategoryText = '';
  this.searchStatusText = '';
  this.filteredCategoryValue = this.categoryValue.slice(0, 5);
  this.filteredStatus = this.status.slice();
  this._healthnableCoreService.tableData.next(this.allDashboardItems);
}

inputClearValue(){
 if (this.searchdashboardText == '') {
    this.getDashboardData(this.pageIndex,this.pageSize)
    }
}
  ngOnDestroy() {
    if (this.paginationDataSubscription) {
      this.paginationDataSubscription.unsubscribe();
    }
    if (this.gridEditOptionSubscription) {
      this.gridEditOptionSubscription.unsubscribe();
    }
  }
  
}
