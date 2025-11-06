import { Component, inject, OnInit, signal } from '@angular/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';

import { PrimeNGModule } from '../../../../material/primeng.module';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { Permission, roleData } from '../../../../type-models/identityManagement';
import { IdentityManagementService } from '../../../../services/identity-management.service';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';


@Component({
  selector: 'healthnable-add-role',
  standalone: true,
  imports: [InputComponent,TextAreaComponent, MaterialModule,
    TranslateModule, ReactiveFormsModule, FormsModule,HeaderComponent,SelectComponent,StatusComponent,PrimeNGModule],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.scss'
})
export class AddRoleComponent implements OnInit {
  reactiveKeywords: string[] = [];
  selectedCheckboxes: string[] = [];
   permissionsData: any[] = [];
  matchedOperations: string[] = [];
 selectedOperationsMap: { [featureName: string]: string[] } = {};
  currentFeatureName: string = '';
searchText: string='' ;
  roleForm!:FormGroup
 reportTo!:any[]
  status!:boolean;

constructor( private router:Router, private fb:FormBuilder,private translate: TranslateService,
  private _healtnableCoreService: HealthnableCoreService,
  private _identityService:IdentityManagementService
){}
  ngOnInit(){
    this.roleForm = this.fb.group({
      role_name: ['', [Validators.required]],   
      report_to : ['', [Validators.required]], 
      description: ['', [Validators.required]],   
      status: [true],
      permissions: [[], Validators.required],
    });
    this.getPermissionData();  
    this.getRoleDropdown() 

  }

  isChecked(feature: string, op: string): boolean {
    return this.selectedOperationsMap[feature]?.includes(op) ?? false;
  }
  //  toggleOperation(feature: string, op: string) {
  //  const selectedOps = this.selectedOperationsMap[feature] || [];

  //   if (selectedOps.includes(op)) {
  //     this.selectedOperationsMap[feature] = selectedOps.filter(o => o !== op);
  //     if (this.selectedOperationsMap[feature].length === 0) {
  //       delete this.selectedOperationsMap[feature];
  //     }
  //   } else {
  //     this.selectedOperationsMap[feature] = [...selectedOps, op];
  //   }
  // }
toggleOperation(feature: string, op: string) {
  const selectedOps = this.selectedOperationsMap[feature] || [];

  if (selectedOps.includes(op)) {
    this.selectedOperationsMap[feature] = selectedOps.filter(o => o !== op);
    if (this.selectedOperationsMap[feature].length === 0) {
      delete this.selectedOperationsMap[feature];
    }
  } else {
    this.selectedOperationsMap[feature] = [...selectedOps, op];
  }

  // Sync with form
  this.roleForm.get('permissions')?.setValue(this.selectedOperationsMap);
  this.roleForm.get('permissions')?.updateValueAndValidity();
}

  getPermissionData(){
    this._identityService.getPermissionDropDown().subscribe({
      next:(data:any)=>{
        this.permissionsData = data;
      }
    })
  }
  onSearchChange(value: string): void {
    const lowerVal = value.toLowerCase();
  if (!lowerVal) {
    this.matchedOperations = [];
      this.currentFeatureName = '';
      return;
  }

    for (const permission of this.permissionsData) {
      for (const feature of permission.features) {
        if (feature.feature_name.toLowerCase()===lowerVal) {
          this.matchedOperations = feature.operations;
          this.currentFeatureName = feature.feature_name;
          return;
        }
      }
    }
     this.matchedOperations = [];
      this.currentFeatureName = '';
  }
  //  onChipRemove(feature: string, op: string): void {
  //   this.toggleOperation(feature, op);
  // }
onChipRemove(feature: string, op: string): void {
  this.toggleOperation(feature, op);

  // Optional: in case toggle doesn't handle all edge cases
  this.roleForm.get('permissions')?.setValue(this.selectedOperationsMap);
  this.roleForm.get('permissions')?.updateValueAndValidity();
}
  get featureNames(): string[] {
    return Object.keys(this.selectedOperationsMap);
  }

  getOperations(feature: string): string[] {
    return this.selectedOperationsMap[feature] || [];
  }
  getRoleDropdown(){
this._identityService.getRoleDropdown().subscribe({
  next:(data:any)=>{
this.reportTo = data.data.role_names.map((role: string) => ({ role_names: role }));
  }
})
}
  // updateFilteredPermissions() {
  //   if (this.searchText) {
  //     console.log('Filtering for:', this.searchText);
  //     this.filteredPermissions = this.permissionDropDown
  //       .filter((item) => (item.name.toLowerCase().includes(this.searchText)));
  //       if (this.filteredPermissions.length === 0) {
  //         this._healthnableCoreService.apiError('No permissions found for the given keyword');
  //       } 
  //   } else {
  //     this.filteredPermissions =[];
  //   }
  // }

 addRole() {
    if (this.roleForm.valid) {
      const rawValue = this.roleForm.value;

      const transformedEntry: roleData = {
        ...rawValue,
        report_to: rawValue.report_to.role_names || '',
        permissions: this.selectedOperationsMap,
        status: rawValue.status ? 'active' : 'inactive'
      };
      console.log('Payload:', JSON.stringify(transformedEntry, null, 2));

      this._identityService.addRole(transformedEntry).subscribe({
        next: (data: any) => {
          this._healtnableCoreService.apiSuccess(`${data.data.role_id} - ${data.message}`);
          this.roleForm.reset({ status: true });
          this.selectedOperationsMap = {};
          this.router.navigate(['/identity/roles/add-role']);
        }
      });
    }
  }
  onCancel(){
    this.router.navigate(['/identity/roles'])
  }
 onStatusChange(): void {
    this.status = this.roleForm.get('status')?.value;
  }
  chipheader=['Attribute','Template','Entity']
}
