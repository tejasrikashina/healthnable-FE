import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MetricActionMapperComponent } from './metric-action-mapper/metric-action-mapper.component';
import { KpiThresholdComponent } from './kpi-threshold/kpi-threshold.component';
import { CommunicationSetupComponent } from './communication-setup/communication-setup.component';


const routes: Routes = [
  {
    path: '',
    children: [
  
         { path: 'kpi-to-action-mapper',
          component: MetricActionMapperComponent
         },
         
         { path: 'kpi-threshold',
          component: KpiThresholdComponent
         },
            { path: 'communication-setup',
          component: CommunicationSetupComponent
         },
          

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertSetupRoutingModule { }
