import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatasetMapperComponent } from './dataset-mapper/dataset-mapper.component';
import { AddDatasetmappingComponent } from './dataset-mapper/add-datasetmapping/add-datasetmapping.component';
import { DataTrackerComponent } from './data-tracker/data-tracker.component';

import { EditDatasetmappingComponent } from './dataset-mapper/edit-datasetmapping/edit-datasetmapping.component';
import { EditDataTrackerComponent } from './data-tracker/edit-data-tracker/edit-data-tracker.component';

const routes: Routes = [
  {
    path: '',
    children: [
      
         { path: 'dashboard-datasetMapper',
          component: DatasetMapperComponent
         },
         { path: 'dashboard-datasetMapper/add-datasetmapping',
          component: AddDatasetmappingComponent
         },
            { path: 'dashboard-datasetMapper/edit-datasetmapping',
          component: EditDatasetmappingComponent
         },
         { path: 'dashboard-dataTracker',
          component: DataTrackerComponent
         },
           { path: 'dashboard-dataTracker/edit-dataTracker',
          component: EditDataTrackerComponent
         }

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatasourceSetupRoutingModule { }
