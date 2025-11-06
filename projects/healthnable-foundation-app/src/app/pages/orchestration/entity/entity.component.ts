import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { Router } from '@angular/router';
import { PrimeNGModule } from '../../../material/primeng.module';
import { MenuItem } from 'primeng/api';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BulkimportExportComponent } from './bulkimport-export/bulkimport-export.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-entity',
  standalone: true,
  imports: [MaterialModule,TranslateModule,CommonModule,TableComponent, HeaderComponent,PrimeNGModule,FormsModule],
  templateUrl: './entity.component.html',
  styleUrl: './entity.component.scss'
})
export class EntityComponent implements OnInit{
  isCardVisible: boolean = false; 
  isCategoryActive: boolean = false; 
  currentCategory: string = ''; 
  categoryItems = [
    { label: 'Mental Health', selected: false },
    { label: 'Compilance', selected: false },
    { label: 'Training ', selected: false },
    { label: 'Certification ', selected: false }
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  displayedColumns=['entityCode','entityName','category','status','bothaction']
    items:MenuItem[] | undefined;
    tags:any;
    dep:boolean=false
    gridViewOptionSubscription!:Subscription
              gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
    searchEntity: string = ''; 
    filteredData: any; 
     constructor(private dialog: MatDialog,private translate:TranslateService,private router:Router,private _healthnableCoreService: HealthnableCoreService){
      translate.get('entity').subscribe((tags: string) => { this.tags = tags });
     }
     addEntity(action:string, obj: any){

    this.router.navigate(['/orchestration/add-entity'],{state:{action,obj}})
  }
  bulkImport(){
    let dialogRef = this.dialog.open(BulkimportExportComponent, { 
      maxWidth: '700px' ,
      disableClose: true
    });
      dialogRef.afterClosed().subscribe((res: any) => {
           
    });
  }
  ngOnInit(){
    this.entityList()
    this.items = [
      {
        label: 'Role Type',
        items:[
          {
            label: 'New',
          }
          
        ]
      },
      {
        label: 'Status',
        items:[
          {
            label: 'Active',
          },
          {
            label: 'Inactive',
          }
          
        ]
      }

    ]
  
    this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'entity') {
        this.router.navigate(['orchestration/edit-entity']);
      }
    });
    this.gridRemoveOptionSubscription = 
    this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
      if (res.tableName === 'entity') {
        this.deleteEntity('Delete', { data: res.data });
      }
    });
  }
  
  dataList=
  [
    {
        "entityCode": "string",
        "entityName": "string",
        "category":"abc",
        "status": "inactive",

    },
    {
       
        "entityCode": "string1",
        "entityName": "string",
       "category":"abc",
        "status": "inactive",
       
    },
    {
        
        "entityCode": "abc",
        "entityName": "xyz",
        "category":"abc",
        "status": "active",
      
    }
]
inputClearValue(){
  if (this.searchEntity == '') {
    this.entityList()
     }
}
entityList(){
      this._healthnableCoreService.tableData.next(this.dataList);    
}
onSearch() {
  if (this.searchEntity) {
  
    this.filteredData = this.dataList.filter(item =>
      item.entityCode.toLowerCase().includes(this.searchEntity.toLowerCase())
    );

    if (this.filteredData.length > 0) {
      this._healthnableCoreService.tableData.next(this.filteredData);
    } else {
      this._healthnableCoreService.tableData.next([]);

    }
  } else {
 
    this.entityList();
  }
}
deleteEntity(action: string, obj: any) {
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
  } else if (this.gridRemoveOptionSubscription) {
    this.gridRemoveOptionSubscription.unsubscribe();
  }
  }
}
