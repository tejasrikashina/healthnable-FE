import { Injectable } from '@angular/core';
import { CommonUsedService } from '../services/common-used.service';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  PageInformation,
  PaginationOptions,
} from '../interface/healthnable-core.interface';
import { MessageService } from 'primeng/api';
import { MetadataService } from '../services/metadata.service';
@Injectable({
  providedIn: 'root',
})
export class HealthnableCoreService {
  regEx = {
    userName: /^[a-zA-Z'\-_]+(?: [a-zA-Z'\-_]+)*$/,
    specialName:/^[a-zA-Z0-9.,&'\-\/()]+(?: [a-zA-Z0-9.,&'\-\/()]+)*$/,
    email: /[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,50}/,
    password: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
    number:/^\d{10}$/,
    taxId:/^\d{2}-\d{7}$/,
    faxNumber: /^\(\d{3}\) \d{3}-\d{4}$/
  };
  private categoryData = new Subject<any>();
  private subcategoryData = new Subject<any>();
  private roleData = new Subject<any>();
  private userData = new Subject<any>();

  paginationData = new BehaviorSubject<PaginationOptions>({
    "pageIndex": 1,
    "pageSize": 5,
    "tableName": '',
  });
  tableData = new BehaviorSubject<any>([]);
  pageInformation = new Subject<PageInformation>();
  gridEditOption = new Subject<any>();
  gridViewOption = new Subject<any>();
  gridCopyOption = new Subject<any>();
  // gridRemoveOption = new BehaviorSubject<{data:{}, tableName:any}>({data: {}, tableName:''});
  gridRemoveOption = new Subject<any>();
    imageData = new Subject<any>(); 
  constructor(
    private _metaService: MetadataService,
    private messageService: MessageService,
  ) {}
  //Categories
  // getCategoryDetails() {
  //   this._metaService.getCategory().subscribe({
  //     next: (data: any) => {
  //       if (data.length > 0) {
  //         this.categoryData.next(data);
  //       } else {
  //         this.categoryData.next(data);
  //         this.apiWarning('No data found');
  //       }
  //     },
  //     error: (err) => {
  //       this.apiError(err.error.detail);
  //     },
  //   });
  //   return this.categoryData;
  // }
  // getSubcategoryDetails() {
  //   this._metaService.getSubcategory().subscribe({
  //     next: (data: any) => {
  //       if (data.length > 0) {
  //         this.subcategoryData.next(data);
  //       } else {
  //         this.subcategoryData.next(data);
  //         this.apiWarning('No data found');
  //       }
  //     },
  //     error: (err) => {
  //       this.apiError(err.error.detail);
  //     },
  //   });
  // }
  //Roles
  // getRolesList() {
  //   this._identityService.getRoles().subscribe({
  //     next: (data: any) => {
  //       if (data.length > 0) {
  //         this.roleData.next(data);
  //       } else {
  //         this.roleData.next(data);
  //         this.apiWarning('No data found');
  //       }
  //     },
  //     error: (err) => {
  //       this.apiError(err.error.detail);
  //     },
  //   });
  //   return this.roleData;
  // }
  // getUsersList(){
  //   this._identityService.getUser().subscribe({
  //     next: (data: any) => {
  //       if (data.length > 0) {
  //         this.userData.next(data);
  //       } else {
  //         this.userData.next(data);
  //         this.apiWarning('No data found');
  //       }
  //     },
  //     error: (err) => {
  //       this.apiError(err.error.detail);
  //     },
  //   });
  //   return this.userData;
  // }
  apiError(msg: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: msg,
    });
  }
  apiSuccess(msg: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: msg,
    });
  }
  apiWarning(msg: string) {
    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: msg });
  }
  apiInfo(msg: string) {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: msg });
  }
}
