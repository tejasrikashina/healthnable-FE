import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';
import { PrimeNGModule } from '../../../material/primeng.module';
import { MenuItem } from 'primeng/api';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditions',
  standalone: true,
 imports: [MaterialModule,CommonModule,HeaderComponent,TableComponent,FormsModule,PrimeNGModule,TranslateModule],
  templateUrl: './conditions.component.html',
  styleUrl: './conditions.component.scss'
})
export class ConditionsComponent implements OnInit{
  isCardVisible: boolean = false; 
  isRoleActive: boolean = false; 
  currentCategory: string = ''; 
  conditionType = [
    { label: 'Validation', selected: false },
    { label: 'Restriction', selected: false },
    { label: 'Auto-Action', selected: false },

  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
    displayedColumns=['conditionName','conditionType','status','bothaction']
    items:MenuItem[] | undefined;
    tags:any;
    searchCondition: string = ''; 
    filteredData:any
        gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
    constructor( private translate:TranslateService,private dialog: MatDialog,private _healthnableCoreService: HealthnableCoreService,private router:Router){
      translate.get('condition').subscribe((tags: string) => { this.tags = tags });
    }
   
  ngOnInit(){
    this.conditionsList()
    this.items = [
     
      {
        label: 'Condition Type',
        items:[
          {
            label: 'Validation',
          },
          {
            label: 'Restriction',
          },
          {
            label: 'Auto-Action',
          }
          
          
        ]
      }

    ]
    this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'condition') {
        this.router.navigate(['orchestration/edit-condition']);
      }
    });
    this.gridRemoveOptionSubscription = 
    this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
      if (res.tableName === 'condition') {
        this.deleteCondition('Delete', { data: res.data });
      }
    });
  }
  dataList=
  [
    {
        "conditionName": "string",
        "conditionType": "string",
        "status": "inactive",

    },
    {
       
        "conditionName": "extreme",
        "conditionType": "string",
        "status": "inactive",
       
    },
    {
        
        "conditionName": "abc",
        "conditionType": "xyz",
        
        "status": "active",
      
    }
]
inputClearValue(){
  if (this.searchCondition == '') {
    this.conditionsList()
     }
}
conditionsList(){
 
      this._healthnableCoreService.tableData.next(this.dataList);
}
  deleteCondition(action: string, obj: any) {
              obj.action = action; 
              let dialogRef = this.dialog.open(DeleteDialogComponent, { 
                data: {obj,
                tags:this.tags
              
                 },
                width: '450px' ,
                disableClose: true
              });
                dialogRef.afterClosed().subscribe((res: any) => {
                     
              });
          
            }
onSearch() {
  if (this.searchCondition) {
  
    this.filteredData = this.dataList.filter(item =>
      item.conditionName.toLowerCase().includes(this.searchCondition.toLowerCase())
    );

    if (this.filteredData.length > 0) {
      this._healthnableCoreService.tableData.next(this.filteredData);
    } else {
      this._healthnableCoreService.tableData.next([]);

    }
  } else {
 
    this.conditionsList();
  }
}
addCondition() {
  this.router.navigate(['orchestration/add-condition']);
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
  showConditionDetails(category: string) {
    this.currentCategory = category; 
    this.isRoleActive = true; 
  }
   ngOnDestroy() {
    if (this.gridEditOptionSubscription) {
      this.gridEditOptionSubscription.unsubscribe();
    } else if (this.gridRemoveOptionSubscription) {
      this.gridRemoveOptionSubscription.unsubscribe();
    }
  }
}
