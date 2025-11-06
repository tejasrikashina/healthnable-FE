import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddRoleComponent } from './role/add-role/add-role.component';
import { RoleComponent } from './role/role.component';
import { UsersComponent } from './users/users.component';
import { AddUserComponent } from './users/add-user/add-user.component';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { EditRoleComponent } from './role/edit-role/edit-role.component';

const routes: Routes = [
  {
    path: '',
    children: [
      
      {
        path: 'roles',
        component: RoleComponent,
      },
      {
        path: 'roles/add-role',
        component: AddRoleComponent,
      },
      {
        path: 'roles/edit-role',
        component: EditRoleComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'users/add-user',
        component: AddUserComponent,
      },
      {
        path: 'users/edit-user/:userId',
        component: EditUserComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IdentityManagementRoutingModule {}
