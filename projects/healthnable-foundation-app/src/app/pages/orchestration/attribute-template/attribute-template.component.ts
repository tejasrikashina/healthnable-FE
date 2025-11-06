import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { PrimeNGModule } from '../../../material/primeng.module';
import { MenuItem } from 'primeng/api';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attribute-template',
  standalone: true,
  imports: [MaterialModule,TableComponent,CommonModule, HeaderComponent, TranslateModule,PrimeNGModule],
  templateUrl: './attribute-template.component.html',
  styleUrl: './attribute-template.component.scss'
})
export class AttributeTemplateComponent implements OnInit{
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
  tags:any
  dep:boolean=true
  constructor(private dialog: MatDialog,private router:Router,private translate:TranslateService,private _healthnableCoreService: HealthnableCoreService ){
    translate.get('templates').subscribe((tags: string) => { this.tags = tags });
  }
  items:MenuItem[] | undefined;
          gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
  gridCopyOptionSubscription!:Subscription
  gridViewOptionSubscription!:Subscription
  displayedColumns =[ 'templateCode','templatename','category','templateType','status','templateaction']
    ngOnInit(){
      this.templateList()
    this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'templates') {
        this.router.navigate(['orchestration/edit-template']);
      }
    });
    this.gridRemoveOptionSubscription = 
    this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
      if (res.tableName === 'templates') {
        this.deleteTemplate('Delete', { data: res.data });
      }
    });
    this.gridCopyOptionSubscription =
    this._healthnableCoreService.gridCopyOption.subscribe((res) => {
      if (res.tableName === 'templates') {
        this.router.navigate(['/orchestration/clone-template']);
      }
    });
  }
  dataList=
  [
    {
        "templateCode": "TEM-001",
        "templatename": "AssetAttribute",
        "category": "Category1",
        "templateType":"Notification",
        "status": "Active",
        

    },
    {
      
      "templateCode": "TEM-002",
      "templatename": "Employee Details",
      "category": "Category2",
      "templateType":"Form",
      "status": "Active",
       
    },
]
  addtemplate(action:string,obj:any){
    this.router.navigate(['/orchestration/add-template'],{state:{action,obj}})
  }
  templateList(){
    this._healthnableCoreService.tableData.next(this.dataList);    
}
deleteTemplate(action: string, obj: any) {
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
