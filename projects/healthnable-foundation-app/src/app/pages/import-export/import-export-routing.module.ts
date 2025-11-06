import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImportEntityComponent } from './import-entity/import-entity.component';
import { ExportEntityComponent } from './export-entity/export-entity.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'import-entity',
        component: ImportEntityComponent
      },
      {
        path: 'export-entity',
        component: ExportEntityComponent
      }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportExportRoutingModule { }
