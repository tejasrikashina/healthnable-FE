import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { TableComponent } from '../../../../core-components/table/table.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../../../services/dashboard.service';
import { DropdownOption, rolBasedData } from '../../../../type-models/dashboard';
import { DeleteRoleBasedComponent } from '../../../../components/pop-ups/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-rolebased',
  standalone: true,
    imports: [MaterialModule,HeaderComponent,ReactiveFormsModule,TranslateModule,SelectComponent,TableComponent, PrimeNGModule],
  templateUrl: './edit-rolebased.component.html',
  styleUrl: './edit-rolebased.component.scss'
})
export class EditRolebasedComponent implements OnInit{
 constructor(private fb:FormBuilder,private translate: TranslateService,
  private dialog:MatDialog,private _healthnableCoreService: HealthnableCoreService,private dashboardSer:DashboardService,){

   translate.get('roleBased').subscribe((tags: string) => { this.tags = tags });
  }
  tags:any
  dep:boolean=true
  // availableDashboards=['Inpatient Flow','ED Dashboard','Surgical Operations','Workforce Management','Compilance & Accreditation']
  availableDashboards: { name: string, checked: boolean }[] = [];
  rolebasedForm!:FormGroup
  assignedDashboards: string[] = [];
      pageSize:number = 5;
  pageIndex:number = 1;
 paginationDataSubscription!:Subscription;
    gridRemoveOptionSubscription!: Subscription;
   displayedColumns:string[]=['role_name','department_names','facility_names','dashboard_names','bothaction']
roleValue: DropdownOption[] = [];
depValue: DropdownOption[] = [];
facilityValue: DropdownOption[] = [];
  ngOnInit() {
   this.getRoleDropdown()
    this.getDepartments()
    this.getFacilities()
     this.getavailableDashboards()
    this.roleDashboardList(this.pageIndex,this.pageSize)
    this.rolebasedForm=this.fb.group({
    role_name: ['', [Validators.required]],
    department_names: ['', [Validators.required]],
    facility_names: ['', [Validators.required]],
    dashboard_names:['']
    })
     this.paginationDataSubscription= this._healthnableCoreService.paginationData.subscribe((res) => {
      if (res.tableName === 'rolebased_dashboard' || '') {
        this.roleDashboardList(res.pageIndex,res.pageSize);
      }
    })
     this.gridRemoveOptionSubscription = 
    this._healthnableCoreService.gridRemoveOption.subscribe((res) => {
      if (res.tableName === 'rolebased_dashboard') {
        this.deleteRoleBased('Delete', { data: res.data });
      }
    });
    
  }
   deleteRoleBased(action: string, obj: any) {
          let dialogRef = this.dialog.open(DeleteRoleBasedComponent, {
            data: {obj,
              tags:this.tags,
              dependencies:this.dep
               },
               width: '450px' ,
               disableClose: true
          });
         dialogRef.afterClosed().subscribe((res: any) => {
        if (res === 'cancel' || !res) {
        
      
          this.roleDashboardList(this.pageIndex,this.pageSize)
        }
       
      });
        }

  checked!:boolean
 
  onCheckboxChange(dashboardName: string, checked: boolean) {
    if (checked) {
      // Move to assigned dashboards
      const index = this.availableDashboards.findIndex(d => d.name === dashboardName);
      if (index !== -1) {
        this.availableDashboards.splice(index, 1); // Remove from available
        if (!this.assignedDashboards.includes(dashboardName)) {
          this.assignedDashboards.push(dashboardName); // Add to assigned
        }
      }
    } else {
      // Move back to available dashboards
      this.assignedDashboards = this.assignedDashboards.filter(d => d !== dashboardName);
      const exists = this.availableDashboards.find(d => d.name === dashboardName);
      if (!exists) {
        this.availableDashboards.push({ name: dashboardName, checked: false });
      }
    }
  }
  
  

removeAssignedDashboard(dashboard: string) {
  this.assignedDashboards = this.assignedDashboards.filter(d => d !== dashboard);
  const alreadyAvailable = this.availableDashboards.find(d => d.name === dashboard);
  if (!alreadyAvailable) {
    this.availableDashboards.push({ name: dashboard, checked: false });
  }
}

saveRoleBasedDashboard() {
  if (this.rolebasedForm.invalid) return;
  this.rolebasedForm.patchValue({
    dashboard_names: this.assignedDashboards
  });

  const formValue = this.rolebasedForm.value;

  const transformedEntry: rolBasedData = {
    ...formValue,
    dashboard_names: this.assignedDashboards,
    department_names: Array.isArray(formValue.department_names)
      ? formValue.department_names
      : [formValue.department_names],
    facility_names: Array.isArray(formValue.facility_names)
      ? formValue.facility_names
      : [formValue.facility_names]
  };

  this.dashboardSer.addRoleBased(transformedEntry).subscribe({
    next: (data: any) => {
      this._healthnableCoreService.apiSuccess(`${data.message}`);
      this.rolebasedForm.reset();
      this.assignedDashboards = [];
      this.getavailableDashboards();
        this.roleDashboardList(this.pageIndex,this.pageSize)
    }
  });

}
  getRoleDropdown(){
this.dashboardSer.getAllRoles().subscribe({
  next:(data:any)=>{
 this.roleValue = Array.isArray(data.data.items) ? data.data.items : [];
  }
})
}
getDepartments(){
  this.dashboardSer.getAllDepartments().subscribe({
  next:(data:any)=>{
this.depValue = Array.isArray(data.data.items) ? data.data.items : [];
  }
})
}
getavailableDashboards(){
  this.dashboardSer.getAllDashboards().subscribe({
    next:(data:any)=>{
      this.availableDashboards=data.data.items.map((d:any) => ({ name: d, checked: false }));
    }
  })
}
getFacilities(){
  this.dashboardSer.getAllFacilities().subscribe({
    next:(data:any)=>{
         this.facilityValue = Array.isArray(data.data.items) ? data.data.items : [];
    }
  })
}
roleDashboardList(pageIndex:number, pageSize:number){
  this.dashboardSer.getroleEntries(pageIndex, pageSize).subscribe({
    next:(dataList:any)=>{
   this._healthnableCoreService.tableData.next(dataList.data.items); 
    this._healthnableCoreService.pageInformation.next(dataList.data);
    }
  })
}
}
