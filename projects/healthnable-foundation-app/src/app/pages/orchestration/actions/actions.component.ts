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
  selector: 'app-actions',
  standalone: true,
 imports: [MaterialModule,HeaderComponent,
  CommonModule,TableComponent,PrimeNGModule,TranslateModule,FormsModule],
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.scss'
})
export class ActionsComponent implements OnInit{
  isCardVisible: boolean = false; 
  isRoleActive: boolean = false; 
  currentCategory: string = ''; 
  ActionType = [
    { label: 'Notification', selected: false },
    { label: 'Data Update', selected: false },
    { label: 'Restriction', selected: false },

  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  displayedColumns=['actionName','actionType','status','bothaction']
    items:MenuItem[] | undefined;
    tags:any
       gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
    searchAction: string = ''; 
    filteredData:any
    constructor( private translate:TranslateService,private dialog: MatDialog,private _healthnableCoreService: HealthnableCoreService, private router:Router){
      translate.get('action').subscribe((tags: string) => { this.tags = tags });
    }
   
  ngOnInit(){
    this.actionsList()
    this.items = [
     
      {
        label: 'Action Type',
        items:[
          {
            label: 'Notification',
          },
          {
            label: 'Data Update',
          },
          {
            label: 'Restriction',
          }
          
          
        ],
        
      },
      {
        label: 'Status',
        items:[
          {
            label: 'Active',
          },
          {
            label: 'Inactive',
          },
      
          
          
        ],
        
      }

    ]
    this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'action') {
        this.router.navigate(['orchestration/edit-action']);
      }
    });
    this.gridRemoveOptionSubscription = 
    this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
      if (res.tableName === 'action') {
        this.deleteAction('Delete', { data: res.data });
      }
    });
  }
  dataList=
  [
    {
        "actionName": "string",
        "actionType": "string",
        "status": "inactive",

    },
    {
       
        "actionName": "string1",
        "actionType": "string",
       
        "status": "inactive",
       
    },
    {
        
        "actionName": "abc",
        "actionType": "xyz",
        
        "status": "active",
      
    }
]

actionsList(){
 
      this._healthnableCoreService.tableData.next(this.dataList);
}
  deleteAction(action: string, obj: any) {
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
inputClearValue(){
  if (this.searchAction == '') {
    this.actionsList()
     }
}
onSearch() {
  if (this.searchAction) {
  
    this.filteredData = this.dataList.filter(item =>
      item.actionName.toLowerCase().includes(this.searchAction.toLowerCase())
    );

    if (this.filteredData.length > 0) {
      this._healthnableCoreService.tableData.next(this.filteredData);
    } else {
      this._healthnableCoreService.tableData.next([]);

    }
  } else {
 
    this.actionsList();
  }
}
addAction() {
  this.router.navigate(['orchestration/add-action']);
   }
ngOnDestroy() {
  if (this.gridEditOptionSubscription) {
    this.gridEditOptionSubscription.unsubscribe();
  } else if (this.gridRemoveOptionSubscription) {
    this.gridRemoveOptionSubscription.unsubscribe();
  }
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
showActionDetails(category: string) {
  this.currentCategory = category; 
  this.isRoleActive = true; 
}
}
