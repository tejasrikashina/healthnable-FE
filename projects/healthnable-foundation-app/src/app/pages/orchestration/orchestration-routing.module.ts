import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowsComponent } from './workflows/workflows.component';
import { AddWorkflowComponent } from './workflows/add-workflow/add-workflow.component';
import { StagesComponent } from './stages/stages.component';
import { ConditionsComponent } from './conditions/conditions.component';
import { ActionsComponent } from './actions/actions.component';
import { EntityComponent } from './entity/entity.component';
import { AttributeTemplateComponent } from './attribute-template/attribute-template.component';
import { CloneTemplateComponent } from './clone-template/clone-template.component';
import { AttributeComponent } from './attribute/attribute.component';
import { AddEntityComponent } from './entity/add-entity/add-entity.component';
import { AddTemplateComponent } from './attribute-template/add-template/add-template.component';
import { AddAttributeComponent } from './attribute/add-attribute/add-attribute.component';
import { CopyAttributeComponent } from './attribute/clone/copy-attribute/copy-attribute.component';
import { AddStageComponent } from './stages/add-stage/add-stage.component';
import { EditStageComponent } from './stages/edit-stage/edit-stage.component';
import { EditConditionComponent } from './conditions/edit-condition/edit-condition.component';
import { AddConditionComponent } from './conditions/add-condition/add-condition.component';
import { BulkimportExportComponent } from './entity/bulkimport-export/bulkimport-export.component';
import { AddActionComponent } from './actions/add-action/add-action.component';
import { EditActionComponent } from './actions/edit-action/edit-action.component';
import { SetWorkflowComponent } from './workflows/add-workflow/set-workflow/set-workflow.component';
import { SetNotificationComponent } from './workflows/add-workflow/set-notification/set-notification.component';
import { EditWorkflowComponent } from './workflows/edit-workflow/edit-workflow.component';
import { EditWorkflowRolesComponent } from './workflows/edit-workflow/edit-workflow-roles/edit-workflow-roles.component';
import { EditSetWorkflowComponent } from './workflows/edit-workflow/edit-set-workflow/edit-set-workflow.component';
import { EditSetNotificationComponent } from './workflows/edit-workflow/edit-set-notification/edit-set-notification.component';
import { AddPreviewworkflowComponent } from './workflows/add-workflow/add-previewworkflow/add-previewworkflow.component';

import { EditAttributeComponent } from './attribute/edit-attribute/edit-attribute.component';
import { EditTemplateComponent } from './attribute-template/edit-template/edit-template.component';
import { EditEntityComponent } from './entity/edit-entity/edit-entity.component';
import { WorkflowRolesComponent } from './workflows/add-workflow/workflow-roles/workflow-roles.component';
import { PreviewTemplateComponent } from './attribute-template/preview-template/preview-template.component';
import { ArrangeFieldsComponent } from './attribute-template/arrange-fields/arrange-fields.component';
import { EditPreviewComponent } from './workflows/edit-workflow/edit-preview/edit-preview.component';
import { ViewWorkflowComponent } from './workflows/view-workflow/view-workflow.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'entity', component: EntityComponent },
      {
        path: 'add-entity',
        component: AddEntityComponent,
      },
      {
        path: 'edit-entity',
        component: EditEntityComponent,
      },
      { path: 'template', component: AttributeTemplateComponent },
      {
        path:'add-template',component:AddTemplateComponent
      },
      {path:'preview-template',component:PreviewTemplateComponent},
      {path:'arrange-fields',component:ArrangeFieldsComponent},
      {
        path:'edit-template',component:EditTemplateComponent
      },
      {path:'bulkimport-export', component:BulkimportExportComponent},
      { path: 'clone-template', component: CloneTemplateComponent },
      { path: 'attribute', component: AttributeComponent },
      { path: 'clone-attribute', component: CopyAttributeComponent },
      {path:'add-attribute',component:AddAttributeComponent},
      {path:'edit-attribute',component:EditAttributeComponent},
      { path: 'workflows', component: WorkflowsComponent },
      {path:'preview-workflow',component:AddPreviewworkflowComponent},
      {path:'edit-preview-workflow',component:EditPreviewComponent},
      { path: 'add-workflow', component: AddWorkflowComponent },
      { path: 'edit-workflow', component: EditWorkflowComponent },
      {path:'view-workflow', component:ViewWorkflowComponent},
      { path: 'workflow-roles', component: WorkflowRolesComponent },
      { path: 'edit-workflow-roles', component:  EditWorkflowRolesComponent},
      {path:'set-workflow',component:SetWorkflowComponent},
      {path:'edit-set-workflow',component:EditSetWorkflowComponent},
      {path:'set-notification',component:SetNotificationComponent},
      {path:'edit-set-notification',component:EditSetNotificationComponent},
      { path: 'stages', component: StagesComponent },
      { path: 'add-stage', component: AddStageComponent },
      { path: 'edit-stage', component: EditStageComponent },
      { path: 'conditions', component: ConditionsComponent },
      { path: 'add-condition', component: AddConditionComponent },
      { path: 'edit-condition', component: EditConditionComponent },
      { path: 'actions', component: ActionsComponent },
      { path: 'add-action', component: AddActionComponent },
      { path: 'edit-action', component: EditActionComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrchestrationRoutingModule {}
