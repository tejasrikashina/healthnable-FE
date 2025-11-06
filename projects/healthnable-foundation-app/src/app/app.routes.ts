import { Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    // redirectTo: '/authentication/login',
    redirectTo: '/login',

  },
  {
    path: '',
    component: FullComponent,
    // canActivate:[authGuard],
  children: [
    {
      path: 'starter',
      loadChildren: () =>
        import('./pages/pages.module').then((m) => m.PagesModule),
    },
    {
      path: 'dashboards',
      loadChildren: () =>
        import('./pages/dashboards/dashboards.module').then(
          (m) => m.DashboardsModule
        ),
    },
         {
      path: 'datasource',
      loadChildren: () =>
        import('./pages/datasource-setup/datasource-setup.module').then(
          (m) => m.DatasourceSetupModule
        ),
    },
      {
        path: 'metadata',
        loadChildren: () =>
          import('./pages/metadata/metadata.module').then(
            (m) => m.MetadataModule
          ),
      },
      {
        path: 'identity',
        loadChildren: () =>
          import('./pages/identityManagement/identityManagement.module').then(
            (m) => m.IdentityManagementModule
          ),
      },
      {
        path: 'orchestration',
        loadChildren: () =>
          import('./pages/orchestration/orchestration.module').then(
            (m) => m.OrchestrationModule
          ),
      },
       {
        path: 'organizations',
        loadChildren: () =>
          import('./pages/organizations/organizations.module').then(
            (m) => m.OrganizationsModule
          ),
      },
       {
        path: 'infrastructure',
        loadChildren: () =>
          import('./pages/Infrastructure/infrastructure.module').then(
            (m) => m.InfrastructureModule
          ),
      },
      {
        path: 'alertsSetup',
        loadChildren: () =>
          import('./pages/alerts-setup/alerts-setup.module').then(
            (m) => m.AlertSetupModule
          ),
      },
       {
      path: 'userDashboard',
      loadChildren: () =>
        import('./pages/endUser/endUser.module').then(
          (m) => m.EndUserModule
        ),
    },
      
    ],
  },
  {
    path: '',

    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/authentication/authentication.module').then(
            (m) => m.AuthenticationModule
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'error',
  },
];
