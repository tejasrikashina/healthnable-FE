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
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [
    MaterialModule,
    TranslateModule,
    TableComponent,
    HeaderComponent,
    PrimeNGModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss',
})
export class WorkflowsComponent implements OnInit {
  isCardVisible: boolean = false; 
  isRoleActive: boolean = false; 
  currentCategory: string = ''; 
  entityType = [
    { label: 'Employee', selected: false },
    { label: 'Patient', selected: false },
  ];
  status = [
    { label: 'Active', selected: false },
    { label: 'Inactive', selected: false },
  ];
  displayedColumns = [
    'workflowCode',
    'workflowName',
    'entityType',
    'status',
    'bothaction',
  ];
  items: MenuItem[] | undefined;
  searchWorkflow: string = '';
  filteredData: any;
  tags: any;
  gridEditOptionSubscription!: Subscription;
  gridRemoveOptionSubscription!: Subscription;
  gridViewOptionSubscription!: Subscription;
  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private _healthnableCoreService: HealthnableCoreService,
    private router: Router
  ) {
    translate.get('workflow').subscribe((tags: string) => {
      this.tags = tags;
    });
  }
  addworkflow(action: string, obj: any) {
    this.router.navigate(['/orchestration/add-workflow'], {
      state: { action, obj },
    });
  }
  ngOnInit() {
    this.workflowList();
    this.items = [
      {
        label: 'Role Type',
        items: [
          {
            label: 'New',
          },
        ],
      },
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
    this.gridViewOptionSubscription =
      this._healthnableCoreService.gridViewOption.subscribe((res) => {
        if (res.tableName === 'workflow') {
          this.viewWorkflow();
        }
      });
    this.gridEditOptionSubscription =
      this._healthnableCoreService.gridEditOption.subscribe((res) => {
        if (res.tableName === 'workflow') {
          this.router.navigate(['orchestration/edit-workflow']);
        }
      });
    this.gridRemoveOptionSubscription =
      this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
        if (res.tableName === 'workflow') {
          this.deleteWorkflow('Delete', { data: res.data });
        }
      });
  }
  dataList = [
    {
      workflowCode: 'SUB-1001',
      workflowName: 'Category Name 1',
      entityType: 'Patient Privacy Regulations',
      status: 'inactive',
    },
    {
      workflowCode: 'SUB-1001',
      workflowName: 'Category Name 1',
      entityType: 'Patient Privacy Regulations',
      status: 'inactive',
    },
  ];
  inputClearValue() {
    if (this.searchWorkflow == '') {
      this.workflowList();
    }
  }
  workflowList() {
    this._healthnableCoreService.tableData.next(this.dataList);
  }
  onSearch() {
    if (this.searchWorkflow) {
      this.filteredData = this.dataList.filter((item) =>
        item.workflowName
          .toLowerCase()
          .includes(this.searchWorkflow.toLowerCase())
      );

      if (this.filteredData.length > 0) {
        this._healthnableCoreService.tableData.next(this.filteredData);
      } else {
        this._healthnableCoreService.tableData.next([]);
      }
    } else {
      this.workflowList();
    }
  }
  viewWorkflow() {
    let dialogRef = this.dialog.open(ViewWorkflowComponent, {
      maxWidth: '750px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {});
  }
  deleteWorkflow(action: string, obj: any) {
    obj.action = action;
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { obj, tags: this.tags },
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: any) => {});
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
  showWorkflowDetails(category: string) {
    this.currentCategory = category; 
    this.isRoleActive = true; 
  }
  ngOnDestroy() {
    this.workflowList()
    if (this.gridEditOptionSubscription) {
      this.gridEditOptionSubscription.unsubscribe();
    } else if (this.gridRemoveOptionSubscription) {
      this.gridRemoveOptionSubscription.unsubscribe();
    }
  }
}
