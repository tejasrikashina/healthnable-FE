import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddDashboardComponent } from './dashboard/add-dashboard/add-dashboard.component';
import { MetricComponent } from './metric/metric.component';
import { RolebasedDashboardComponent } from './rolebased-dashboard/rolebased-dashboard.component';
import { EditDashboardComponent } from './dashboard/edit-dashboard/edit-dashboard.component';
import { DashboardWidgetComponent } from './dashboard-widget/dashboard-widget.component';
import { DashboardMetricComponent } from './dashboard-metric/dashboard-metric.component';
import { DashboardEditwidgetComponent } from './dashboard-widget/dashboard-editwidget/dashboard-editwidget.component';
import { DrilldownSetupComponent } from './drilldown-setup/drilldown-setup.component';
import { MetriclevelAccessComponent } from './metriclevel-access/metriclevel-access.component';
import { EditMetriclevelAccessComponent } from './metriclevel-access/edit-metriclevel-access/edit-metriclevel-access.component';
import { LogicBuilderComponent } from './metric/logic-builder/logic-builder.component';
import { DashboardEditmetricComponent } from './dashboard-metric/dashboard-editmetric/dashboard-editmetric.component';
import { EditKpiComponent } from './metric/edit-kpi/edit-kpi.component';
import { EditRolebasedComponent } from './rolebased-dashboard/edit-rolebased/edit-rolebased.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'dashboard',
         component: DashboardComponent
        },
         {
                path: 'kpi',
                component: MetricComponent,
              },
              {
                path: 'role-based-dashboard',
                component: RolebasedDashboardComponent,
              },
              {
                path:'dashboard/edit-roleBased',
                component:EditRolebasedComponent
              },
        { path: 'dashboard/add-dashboard',
          component: AddDashboardComponent
         },
         { path: 'dashboard/edit-dashboard/:dashboardCode',
          component: EditDashboardComponent,
      
         },
         { path: 'dashboard-widget',
          component: DashboardWidgetComponent
         },
         { path: 'dashboard/edit-widget',
          component: DashboardEditwidgetComponent
         },
         { path: 'dashboard-metric',
          component: DashboardMetricComponent
         },
              { path: 'dashboard/edit-kpi/:kpiCode',
          component: EditKpiComponent
         },
           { path: 'dashboard/edit-metric',
          component: DashboardEditmetricComponent
         },
          { path: 'dashboard-metric/logic-builder/:dataset',
          component: LogicBuilderComponent
         },
         { path: 'dashboard-drilldownSetup',
          component: DrilldownSetupComponent
         },
        
           { path: 'dashboard-metricLevel',
          component: MetriclevelAccessComponent
         },
          { path: 'dashboard/edit-metricLevel',
          component: EditMetriclevelAccessComponent
         },

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }
