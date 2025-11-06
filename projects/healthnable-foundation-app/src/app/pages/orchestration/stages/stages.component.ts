import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { TableComponent } from '../../../core-components/table/table.component';
import { PrimeNGModule } from '../../../material/primeng.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stages',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderComponent,
    TableComponent,
    CommonModule,
    PrimeNGModule,
    TranslateModule,
    FormsModule,
  ],
  templateUrl: './stages.component.html',
  styleUrl: './stages.component.scss',
})
export class StagesComponent implements OnInit {
  isCardVisible: boolean = false;
  isRoleActive: boolean = false;
  currentCategory: string = '';
  stageType = [
    { label: 'Standard', selected: false },
    { label: 'Approval Required', selected: false },
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  dep: boolean = false;
  tags: any;
  displayedColumns = ['stageName', 'stageType', 'status', 'bothaction'];
  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService,
    private router: Router
  ) {
    translate.get('stage').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
  items: MenuItem[] | undefined;
  gridViewOptionSubscription!:Subscription
  gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
  searchStage: string = '';
  filteredData: any;
  ngOnInit() {
    this.stagesList();
    this.items = [
      {
        label: 'Status',
        items: [
          {
            label: 'Active',
          },
          {
            label: 'Inactive',
          },
        ],
      },
    ];
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'stage') {
          this.router.navigate(['orchestration/edit-stage']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'stage') {
          this.deleteStage('Delete', { data: res.data });
        }
      });
  }
  dataList = [
    {
      stageName: 'string',
      stageType: 'string',
      status: 'inactive',
    },
    {
      stageName: 'string1',
      stageType: 'string',

      status: 'inactive',
    },
    {
      stageName: 'abc',
      stageType: 'xyz',

      status: 'active',
    },
  ];
  deleteStage(action: string, obj: any) {
    obj.action = action;
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { obj, tags: this.tags, dependencies: this.dep },
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {});
  }
  inputClearValue() {
    if (this.searchStage == '') {
      this.stagesList();
    }
  }
  stagesList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
  onSearch() {
    if (this.searchStage) {
      this.filteredData = this.dataList.filter((item) =>
        item.stageName.toLowerCase().includes(this.searchStage.toLowerCase())
      );

      if (this.filteredData.length > 0) {
        this._healthnableCoreService.tableData.next(this.filteredData);
      } else {
        this._healthnableCoreService.tableData.next([]);
      }
    } else {
      this.stagesList();
    }
  }
  addStage() {
    this.router.navigate(['orchestration/add-stage']);
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
  selectedCategory: string = '';
  onClick(category: string) {
    this.selectedCategory = category;
  }
  showStageDetails(category: string) {
    this.currentCategory = category;
    this.isRoleActive = true;
  }
}
