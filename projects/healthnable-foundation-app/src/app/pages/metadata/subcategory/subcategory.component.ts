import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../core-components/table/table.component';
import { PrimeNGModule } from '../../../material/primeng.module';
import { MatDialog } from '@angular/material/dialog';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { FeatherModule } from 'angular-feather';
import { MatMenuTrigger } from '@angular/material/menu';
import { CommonUsedService } from '../../../services/common-used.service';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subcategory',
  standalone: true,
  imports: [MaterialModule, TranslateModule, ReactiveFormsModule,FeatherModule, HeaderComponent,TableComponent,PrimeNGModule,NgScrollbarModule,CommonModule],
  templateUrl: './subcategory.component.html',
  styleUrl: './subcategory.component.scss'
})
export class SubcategoryComponent implements OnInit, OnDestroy{
  isCardVisible: boolean = false; 
  isCategoryActive: boolean = false; 
  currentCategory: string = ''; 
  categoryItems = [
    { label: 'Category 1', selected: false },
    { label: 'Category 2', selected: false },
    { label: 'Category 3', selected: false }
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  dep:boolean=false
    tags:any
    items:MenuItem[] | undefined;
    statusval:boolean=false
    statusMenu!: MatMenuTrigger;
      gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
    constructor(private dialog: MatDialog,private router:Router, private translate:TranslateService,private fb:FormBuilder,
      private _commonUsedService: CommonUsedService,private _healthnableCoreService: HealthnableCoreService
    ) {
      translate.get('subcategory').subscribe((tags: string) => { this.tags = tags });
    }
   form!:FormGroup
  displayedColumns: string[] = ['SCcode','SCname','categoryName', 'status','bothaction'];
  locationValue = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
];
ngOnInit() {
  this.subcategoryList()
      this.form = this.fb.group({
        category:[''],  
        isActive:[true]
      });
      this.items = [
    
        {
          label: 'Category',
          items:[
            {
              label: 'category 1',
            },
            {
              label: 'category 2',
            },
            {
              label: 'category 3',
            },
            {
              label: 'category 4',
            },
           
            
          ]
        }
  
      ]
      this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'subcategory') {
          this.router.navigate(['metadata/edit-subcategories']);
        }
      });
      this.gridRemoveOptionSubscription = 
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'subcategory' ) {
          this.deleteSubcategory('Delete', { data: res.data });
        }
      });
    }
addSubCat(){
   this.router.navigate(['/metadata/add-subcategories']);
  }
    deleteSubcategory(action: string, obj: any) {
          obj.action = action; 
          let dialogRef = this.dialog.open(DeleteDialogComponent, { 
            data: {obj,
            tags:this.tags,
            dependencies:this.dep
             },
            width: '450px' ,
            disableClose: true
          });
            dialogRef.afterClosed().subscribe((res: any) => {
          });
      
        }
        dataList=
        [
          {
            "SCcode":"SUB-1001",
             "categoryName":"Category Name 1",
              "SCname": "Patient Privacy Regulations",
              "status": "inactive",
    
          },
          {
             
            "SCcode":"SUB-1002",
            "categoryName":"Category Name 2",
             "SCname": "Clinical Documentation Standards",
             "status": "inactive",
             
          },
         
      ]
        subcategoryList() {
          // this._commonUsedService.getSubcategory().subscribe({
          //   next: (dataList:any) => {
          //   this._healthnableCoreService.tableData.next(dataList);
          // },
          // error: () => {
          //   }
          // })
          this._healthnableCoreService.tableData.next(this.dataList);    
        }
        toggleCardVisibility() {
          this.isCardVisible = !this.isCardVisible; 
          if (!this.isCardVisible) {
            this.isCategoryActive = false; 
            this.currentCategory = '';
          }
        }
        selectedCategory: string = ''
        onClick(category: string) {
          this.selectedCategory = category; 
        }
        showCategoryDetails(category: string) {
          this.currentCategory = category; 
          this.isCategoryActive = true; 
        }
        ngOnDestroy() {
          if (this.gridEditOptionSubscription) {
            this.gridEditOptionSubscription.unsubscribe();
          }
          if (this.gridRemoveOptionSubscription) {
            this.gridRemoveOptionSubscription.unsubscribe();
          }
        }
}
