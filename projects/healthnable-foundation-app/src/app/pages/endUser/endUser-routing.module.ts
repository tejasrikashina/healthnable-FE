import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EndUserDashboardComponent } from './end-user-dashboard/end-user-dashboard.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'dashboard-inPatient',
              component: EndUserDashboardComponent
             }, 

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EndUserRoutingModule { }
