import { NavItem } from './nav-item/nav-item';
export const navItems: NavItem[] = [
  {
    navCap: 'Main',
  },
  {
    displayName: 'sidebar.dashboard',
    route: 'dashboards',
    children: [
      {
        displayName: 'sidebar.dashboardManager',
        routeChild: '/dashboards/dashboard',
      },
      {
        displayName: 'sidebar.kpi',
        routeChild: '/dashboards/kpi',
      },
      {
        displayName: 'sidebar.role_dashboard',
        routeChild: '/dashboards/role-based-dashboard',
      },
      {
        displayName: 'sidebar.widget',
        routeChild: '/dashboards/dashboard-widget',
      },
      {
        displayName: 'sidebar.metric',
        routeChild: '/dashboards/dashboard-metric',
      },
      {
        displayName: 'sidebar.drilldown',
        routeChild: '/dashboards/dashboard-drilldownSetup',
      },
     
      {
        displayName: 'Metric Level Access',
        routeChild: '/dashboards/dashboard-metricLevel',
      },
    ],
  },
    {
    displayName: 'sidebar.dataSource',
    route: 'datasource',
    children: [
      {
        displayName: 'sidebar.datasetmapper',
        routeChild: '/datasource/dashboard-datasetMapper',
      },
      {
        displayName: 'sidebar.dataTracker',
        routeChild: '/datasource/dashboard-dataTracker',
      },
      
    ],
  },
  // {
  //   displayName: 'sidebar.metadata',
  //   route: 'metadata',
  //   children: [

  //     {
  //       displayName: 'sidebar.categories',
  //       routeChild: 'metadata/categories',
  //     },
  //     {
  //       displayName: 'sidebar.subcategories',
  //       routeChild: 'metadata/subcategories',
  //     },

  //   ],
  // },
  {
    displayName: 'sidebar.identitymanagement',
    route: 'identity',
    children: [

      {
        displayName: 'sidebar.role',
        routeChild: 'identity/roles',
      },
      {
        displayName: 'sidebar.users',
        routeChild: 'identity/users',
      },
    ],
  },
    {
    displayName: 'sidebar.administration',
    route: 'organizations',
    children: [
     
      {
        displayName: 'sidebar.organization',
        routeChild: 'organizations/organization',
      },
      {
        displayName: 'sidebar.facility',
        routeChild: 'organizations/facility',
      },
      {
        displayName: 'sidebar.department',
        routeChild: 'organizations/department',
      },
      {
        displayName: 'sidebar.speciality',
        routeChild: 'organizations/speciality',
      },
    ],
  },
//    {
//     displayName: 'sidebar.institutionalBP',
//     route: 'infrastructure',
//     children: [

//       {
//         displayName: 'sidebar.floors',
//         routeChild: 'infrastructure/floor',
//       },
//        {
//         displayName: 'sidebar.bed',
//         routeChild: 'infrastructure/bed',
//       },
//        {
//         displayName: 'sidebar.ward',
//         routeChild: 'infrastructure/ward',
//       },

//  {
//         displayName: 'sidebar.nurse',
//         routeChild: 'infrastructure/nurse',
//       },
//        {
//         displayName: 'sidebar.room',
//         routeChild: 'infrastructure/room',
//       },
      
//     ],
//   },
  // {
  //   displayName: 'sidebar.orchestration',
  //   route: 'orchestration',
  //   children: [
  //     {
  //       displayName: 'sidebar.attributes',
  //       routeChild: 'orchestration/attribute',

  //     },
  //     {
  //       displayName: 'sidebar.template',
  //       routeChild: 'orchestration/template',
  //     },
  //     {
  //       displayName: 'sidebar.entities',
  //       routeChild: 'orchestration/entity',
  //     },
  //     {
  //       displayName: 'sidebar.stage',
  //       routeChild: 'orchestration/stages',
  //     },
  //     {
  //       displayName: 'sidebar.condition',
  //       routeChild: 'orchestration/conditions',
  //     },
  //     {
  //       displayName: 'sidebar.action',
  //       routeChild: 'orchestration/actions',
  //     },
  //     {
  //       displayName: 'sidebar.workflow',
  //       routeChild: 'orchestration/workflows',
  //     },

  //   ],
  // },
  // {
  //   displayName: 'sidebar.notification',
  //   route: 'notification',
  //   children: [
  //     {
  //       displayName: 'sidebar.alertrule',
  //       routeChild: 'notification/alertrules',
  //     },
  //   ],
  // },
   {
    displayName: 'sidebar.alertsSetup',
    route: 'alertsSetup',
    children: [
      {
        displayName: 'sidebar.metricMapper',
        routeChild: 'alertsSetup/kpi-to-action-mapper',
      },
        {
        displayName: 'sidebar.kpiThreshold',
        routeChild: 'alertsSetup/kpi-threshold',
      },
       {
        displayName: 'sidebar.communicationSetup',
        routeChild: 'alertsSetup/communication-setup',
      },
    ],
  },
   {
    displayName: 'sidebar.userDashboard',
    route: 'userDashboard',
    children: [
      {
        displayName: 'sidebar.endUser',
        routeChild: '/userDashboard/dashboard-inPatient',
      },
    ],
  },
];





































