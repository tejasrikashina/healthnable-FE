import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { TableComponent } from '../../../core-components/table/table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PrimeNGModule } from '../../../material/primeng.module';
import { CommonModule } from '@angular/common';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { IdentityManagementService } from '../../../services/identity-management.service';
import { PaginationModel } from '../../../type-models/user';

@Component({
  selector: 'healthnable-users',
  standalone: true,
  imports: [MaterialModule, TableComponent,TranslateModule, HeaderComponent, PrimeNGModule,CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, OnDestroy{
  UserPagination: PaginationModel = new PaginationModel();
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  isCardVisible: boolean = false; 
  isRoleActive: boolean = false; 
  searchUserName: string = "";
  currentCategory:string=''
  roleType:any = [
    { label: 'User', selected: false },
    { label: 'Admin', selected: false },
    { label: 'SuperAdmin', selected: false }

  ];
  status:any = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  tags:any
  pageData = {
    pageIndex: 1,
    pageSize: 5
  }
  dep:boolean=false
    items:MenuItem[] | undefined;
  paginationDataSubscription!: Subscription;
      gridEditOptionSubscription!: Subscription;
      gridViewOptionSubscription!:Subscription
      gridRemoveOptionSubscription!: Subscription;
  constructor(private translate: TranslateService,private router:Router,
      private dialog: MatDialog,    
      private _identityService: IdentityManagementService, 
     private _healthnableCoreService: HealthnableCoreService){
  translate.get('deleteUser').subscribe((tags: string) => { this.tags = tags });

  }
  displayedColumns: string[] = ['first_name', 'last_name',  'email','roles','department', 'last_login_ip', 'status','bothaction'];
  ngOnInit(){
 this.getUserDetailsOnPageChange(this.pageData.pageIndex, this.pageData.pageSize)
     this.paginationDataSubscription =
      this._healthnableCoreService.paginationData.subscribe((res) => {
        if (res.tableName === 'users') {
          this.getUserDetailsOnPageChange(res.pageIndex, res.pageSize);
        }
      });
    this.gridEditOptionSubscription =
    this._healthnableCoreService.gridEditOption.subscribe((res) => {
      if (res.tableName === 'users') {
        this.router.navigate([`/identity/users/edit-user/${res.data.user_id}`]);
      
      }
    });
    this.gridRemoveOptionSubscription = 
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'users') {
      
          this.deleteUser('Delete', { data: res.data });
        }
      });
  }

getUserDetailsOnPageChange(pageIndex:number, pageSize:number){
  this._identityService.getAllUsers(pageIndex, pageSize).subscribe({
    next:(dataList:any)=>{
 this._healthnableCoreService.tableData.next(dataList.data.items); 
    this._healthnableCoreService.pageInformation.next(dataList.data);
    }
  })


}
inputClearValue(){
  if (this.searchUserName == '') {
    this.getUserDetailsOnPageChange(this.pageData.pageIndex, this.pageData.pageSize);
  }
}
enterEvent(){
  this.getUserDetailsOnPageChange(this.pageData.pageIndex, this.pageData.pageSize);
  
}
deleteUser(action: string, obj: any) {
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
      
      } 
       else {
        this.getUserDetailsOnPageChange(this.pageData.pageIndex, this.pageData.pageSize);
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
  addUser(){
    this.router.navigate(['/identity/users/add-user'])
    // this.router.navigate(['/identity/add-user'],{state:{action,obj}})
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
