import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationComponent } from './organization/organization.component';
import { SpecialityComponent } from './speciality/speciality.component';
import { FacilityComponent } from './facility/facility.component';
import { DepartmentComponent } from './department/department.component';
import { AddOrgComponent } from './organization/add-org/add-org.component';
import { EditOrgComponent } from './organization/edit-org/edit-org.component';
import { AddFacilityComponent } from './facility/add-facility/add-facility.component';
import { EditFacilityComponent } from './facility/edit-facility/edit-facility.component';
import { EditDepartmentComponent } from './department/edit-department/edit-department.component';
import { AddDepartmentComponent } from './department/add-department/add-department.component';
import { EditSpecialityComponent } from './speciality/edit-speciality/edit-speciality.component';
import { AddSpecialityComponent } from './speciality/add-speciality/add-speciality.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'organization', component: OrganizationComponent },
      {
        path: 'organization/add-organization',
        component: AddOrgComponent,
      },
      {
        path: 'organization/edit-organization/:orgCode',
        component: EditOrgComponent,
      },
      { path: 'department', component: DepartmentComponent },
      {
        path: 'organization/add-department',
        component: AddDepartmentComponent,
      },
      {
        path: 'organization/edit-department',
        component: EditDepartmentComponent,
      },
      { path: 'facility', component: FacilityComponent },
      {
        path: 'organization/add-facility',
        component: AddFacilityComponent,
      },
      {
        path: 'organization/edit-facility/:facilityCode',
        component: EditFacilityComponent,
      },
      { path: 'speciality', component: SpecialityComponent },
      {
        path: 'organization/add-speciality',
        component: AddSpecialityComponent,
      },
      {
        path: 'organization/edit-speciality',
        component: EditSpecialityComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
