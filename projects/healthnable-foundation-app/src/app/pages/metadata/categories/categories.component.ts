import { MaterialModule } from '../../../material/material.module';
import { TableComponent } from '../../../core-components/table/table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MenuItem } from 'primeng/api';
import { PrimeNGModule } from '../../../material/primeng.module';
import { CommonUsedService } from '../../../services/common-used.service';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { Subscription } from 'rxjs';
import { MetadataService } from '../../../services/metadata.service';
import { Category } from '../../../type-models/category';
import { CommonModule } from '@angular/common';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
@Component({
  selector: 'healthnable-categories',
  standalone: true,
  imports: [
    MaterialModule,
    TranslateModule,
    TableComponent,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    PrimeNGModule,
    CommonModule,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  isCardVisible: boolean = false; 
  isCategoryActive: boolean = false; 
  currentCategory: string = ''; 
  searchTerm: string = ''; 
  categoryItems = [
    { label: 'Data Type', selected: false },
    { label: 'Workflow Type', selected: false },
    { label: 'Configuration Type', selected: false }
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];

  displayedColumns: string[] = ['category_id', 'category_name', 'category_status', 'bothaction'];
  searchCategoryName: string = '';
  tags: any;
  dep: boolean = false;
  pageData = {
    pageIndex: 1,
    pageSize: 5,
  };
  gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;

  private subscription!: Subscription;
  paginationDataSubscription!: Subscription;
  showCategoryItems: boolean = false;
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private _categoryservice: MetadataService,
    private translate: TranslateService,
    private _metaService: MetadataService,
    private _healthnableCoreService: HealthnableCoreService
  ) {
    translate.get('category').subscribe((tags: string) => {
      this.tags = tags;
    });
  }

  ngOnInit() {
    // this.categoryList();
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'categories') {
          this.router.navigate(['metadata/edit-categories']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'categories') {
          this.deleteCategory('Delete', { data: res.data });
        }
      });
  }
  addCategories(action: string, obj: any) {
    this.router.navigate(['metadata/add-categories']);
  }

  deleteCategory(action: string, obj: any) {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { obj, tags: this.tags, dependencies: this.dep },
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      // console.log(res);
      // if (res === 'cancel' || !res) {
      // } else {
      //   this.categoryList();
      // }
    });
  }

  // categoryList() {
  //   this._metaService.getCategory().subscribe({
  //     next: (dataList: any) => {
  //       this._healthnableCoreService.tableData.next(dataList);
  //     },
  //   });
  // }
  enterEvent() {
    // this.paginationDataSubscription =
    //   this._healthnableCoreService.paginationData.subscribe((res) => {
    //     this._categoryservice
    //       .getcategoryList(this.searchCategoryName)
    //       .subscribe({
    //         next: (categories) => {
    //           this.tableData = categories;
    //           this._healthnableCoreService.tableData.next(categories);
    //         },
    //       });
    //   });
  }
  inputClearValue() {
    // if (this.searchCategoryName == '') {
    //   this.categoryList();
    // }
  }
  tableData: Category[] = [];

  ngOnDestroy() {
    this.gridEditOptionSubscription.unsubscribe();
    this.gridRemoveOptionSubscription.unsubscribe();
  }
  toggleCardVisibility() {
    this.isCardVisible = !this.isCardVisible; 
    if (!this.isCardVisible) {
      this.isCategoryActive = false; 
      this.currentCategory = '';
    }
  }
  showCategoryDetails(category: string) {
    this.currentCategory = category; 
    this.isCategoryActive = true; 
  }
  search() {
  }
  onCheckboxChange() {
    if (this.isCategoryActive) {
      const allSelected = this.categoryItems.every(item => item.selected);
      if (allSelected) {
       
        this.isCategoryActive = false;
        this.currentCategory = ''; 
      }
    }
  }
  selectedCategory: string = ''
  onClick(category: string) {
    this.selectedCategory = category; 
  }
}
