import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../../../core-components/table/table.component';
import { MaterialModule } from '../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PrimeNGModule } from '../../../material/primeng.module';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-attribute',
  standalone: true,
  imports: [
    TableComponent,
    MaterialModule,
    FormsModule,
    TranslateModule,
    HeaderComponent,
    PrimeNGModule,
    CommonModule,
  ],
  templateUrl: './attribute.component.html',
  styleUrl: './attribute.component.scss',
})
export class AttributeComponent implements OnInit {
  isCardVisible: boolean = false;
  isCategoryActive: boolean = false;
  currentCategory: string = '';
  searchTerm: string = '';
  categorySearchTerm: string = '';
  subcategorySearchTerm: string = '';
  statusSearchTerm: string = '';

  categoryItems = [
    { label: 'Patient Data', selected: false },
    { label: 'Compilance', selected: false },
    { label: 'Billing', selected: false },
  ];
  subcategory = [
    { label: 'String', selected: false },
    { label: 'Number', selected: false },
    { label: 'Boolean', selected: false },
    { label: 'JSON', selected: false },
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  filteredCategoryItems = this.categoryItems;
  filteredSubcategoryItems = this.subcategory;
  filteredStatusItems = this.status;
  dep: boolean = false;
  tags: any;
  items: MenuItem[] | undefined;
  gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
  gridCopyOptionSubscription!: Subscription;
  gridViewOptionSubscription!:Subscription
  displayedColumns = [
    'attrCode',
    'attributeName',
    'dataType',
    'category',
    'subCategory',
    'status',
    'action',
  ];
  constructor(
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService,
    private translate: TranslateService,
    private router: Router
  ) {
    translate.get('attributes').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
  addAttribute() {
    this.router.navigate(['orchestration/add-attribute']);
  }

  ngOnInit() {
    this.attributeList();
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'attribute') {
          this.router.navigate(['orchestration/edit-attribute']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'attribute') {
          this.deleteAttribute('Delete', { data: res.data });
        }
      });
    this.gridCopyOptionSubscription =
      this._healthnableCoreService.gridCopyOption.subscribe((res) => {
        if (res.tableName === 'attribute') {
          this.router.navigate(['/orchestration/clone-attribute']);
        }
      });
  }

  dataList = [
    {
      attrCode: 'ATR-001',
      attributeName: 'Date of Birth',
      dataType: 'Date/Time',
      category: 'patient Data, HR',
      subCategory: 'Subcategory1',
      status: 'Active',
    },
    {
      attrCode: 'ATR-002',
      attributeName: 'Insurance Valid',
      dataType: 'Boolean',
      category: 'Compilance Billing',
      subCategory: 'Subcategory2',
      status: 'Active',
    },
  ];
  attributeList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
  deleteAttribute(action: string, obj: any) {
    obj.action = action;
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { obj, tags: this.tags, dependencies: this.dep },
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {});
  }

  showCategoryDetails(category: string) {
    this.currentCategory = category;
    this.isCategoryActive = true;
  }
  search() {
  }
  onCheckboxChange() {
    this.filterDataList();

    if (this.isCategoryActive) {
      const allSelected = this.categoryItems.every((item) => item.selected);
      if (allSelected) {
        this.isCategoryActive = false;
        this.currentCategory = '';
      }
    }
  }
  selectedCategory: string = '';
  onClick(category: string) {
    this.selectedCategory = category;
  }
  toggleCardVisibility() {
    this.isCardVisible = !this.isCardVisible;
    if (!this.isCardVisible) {
      this.isCategoryActive = false;
      this.currentCategory = '';
    }
  }
  resetFilters() {
      this.categorySearchTerm = '';
      this.subcategorySearchTerm = '';
      this.statusSearchTerm = '';
      this.categoryItems.forEach((item) => (item.selected = false));
      this.subcategory.forEach((item) => (item.selected = false));
      this.status.forEach((item) => (item.selected = false));
      this.filteredCategoryItems = [...this.categoryItems];
      this.filteredSubcategoryItems = [...this.subcategory];
      this.filteredStatusItems = [...this.status];
      this.isCardVisible = !this.isCardVisible;
      this._healthnableCoreService.tableData.next(this.dataList);  
  }
  filterDataList() {
    const selectedCategories = this.categoryItems
      .filter((item) => item.selected)
      .map((item) => item.label.toLowerCase());
    const selectedSubcategories = this.subcategory
      .filter((item) => item.selected)
      .map((item) => item.label.toLowerCase());
    const selectedStatus = this.status
      .filter((item) => item.selected)
      .map((item) => item.label.toLowerCase());
    let filteredData = this.dataList;
    if (selectedCategories.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedCategories.some((category) =>
          item.category.toLowerCase().includes(category)
        )
      );
    }
    if (selectedSubcategories.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedSubcategories.some((sub) =>
          item.subCategory.toLowerCase().includes(sub)
        )
      );
    }
    if (selectedStatus.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedStatus.includes(item.status.toLowerCase())
      );
    }
    this._healthnableCoreService.tableData.next(filteredData);
  }
  inputClearValue() {
    if (this.currentCategory === 'category' && this.categorySearchTerm === '') {
     this.filteredCategoryItems=this.categoryItems;
    }
    if (
      this.currentCategory === 'subcategory' &&
      this.subcategorySearchTerm === ''
    ) {
   this.filteredSubcategoryItems= this.subcategory;
    }
    if (this.currentCategory === 'status' && this.statusSearchTerm === '') {
   this.filteredStatusItems=this.status;
    }
  }
  onSearch() {
    if ( this.categorySearchTerm!='') {
      this.filteredCategoryItems = this.categoryItems.filter((item) =>
        item.label.toLowerCase().includes(this.categorySearchTerm.toLowerCase())
    
      );
   
      // if (this.filteredCategoryItems.length > 0 && this.filteredCategoryItems.some((item) => item.label.toLowerCase() === this.categorySearchTerm)) {
      //   this.categoryItems = this.filteredCategoryItems;
      // }
      // else{
      //   this.categoryItems
      // }
    }
    else{
      this.filteredCategoryItems= this.categoryItems
    }


    if ( this.subcategorySearchTerm!='') {
      this.filteredSubcategoryItems = this.subcategory.filter((item) =>
        item.label
          .toLowerCase()
          .includes(this.subcategorySearchTerm.toLowerCase())
      );
      // if (this.filteredSubcategoryItems.length > 0 && this.filteredSubcategoryItems.some((item) => item.label.toLowerCase() === this.subcategorySearchTerm)) {
      //   this.subcategory = this.filteredSubcategoryItems;
      // }
      // else{
      //   this.subcategory
      // }
    }
    else{
      this.filteredSubcategoryItems=  this.subcategory
    }

    if ( this.statusSearchTerm!='') {
      this.filteredStatusItems = this.status.filter((item) =>
        item.label.toLowerCase().includes(this.statusSearchTerm.toLowerCase())
      );
     
      // if (this.filteredStatusItems.length > 0 && this.filteredStatusItems.some((item) => item.label.toLowerCase() === this.statusSearchTerm)) {
      //   this.status = this.filteredStatusItems;
      // }
      // else{
      //   this.status
      // }
    }
    else{
      this.filteredStatusItems= this.status
    }
  }
 
  ngOnDestroy() {
    if (this.gridEditOptionSubscription) {
      this.gridEditOptionSubscription.unsubscribe();
    } else if (this.gridRemoveOptionSubscription) {
      this.gridRemoveOptionSubscription.unsubscribe();
    }
  }
}
