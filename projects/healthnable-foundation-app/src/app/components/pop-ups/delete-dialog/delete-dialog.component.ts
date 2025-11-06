import { ChangeDetectorRef, Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FeatherModule } from 'angular-feather';
import { MaterialModule } from '../../../material/material.module';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { DashboardService } from '../../../services/dashboard.service';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import { OrganizationService } from '../../../services/organization.service';
import { IdentityManagementService } from '../../../services/identity-management.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'healthnable-delete-dialog',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule,CommonModule],
  templateUrl: 'delete-dialog.component.html',
  styleUrl: 'delete-dialog.component.scss'
})

export class DeleteDialogComponent implements OnInit{

tags:any
dependencies!:boolean
local_data: any;
deleteSubValue!:string
constructor(private translate: TranslateService,private _orgService:OrganizationService,
  public dialogRef: MatDialogRef<DeleteDialogComponent>, 
  private cdr: ChangeDetectorRef, private _identitymanagementService:IdentityManagementService,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: any,private _dashboardService:DashboardService,
  private _healthnableCoreService:HealthnableCoreService){
 this.local_data = { ...data.obj }
  this.tags = { ...data.tags }
  this.deleteSubValue={...data.tags.deleteSubValue}
  this.dependencies={...data.dependencies}
}
ngOnInit(): void {

}
onCancel()
{
  this.dialogRef.close();
}
delete(){
}
}
@Component({
  selector: 'healthnable-delete-department',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule,CommonModule],
  templateUrl: 'delete-dep.component.html',
  styleUrl: 'delete-dialog.component.scss'
})

export class DeleteDepComponent{

tags:any
dependencies!:boolean
local_data: any;
depCode:any
deleteDepValue!:string;
deleteSubValue!:string
constructor(private translate: TranslateService,private _orgService:OrganizationService,
  public dialogRef: MatDialogRef<DeleteDepComponent>, 
  private cdr: ChangeDetectorRef,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  private _healthnableCoreService:HealthnableCoreService){
 this.local_data = { ...data.obj }
  this.tags = { ...data.tags }
  this.depCode=this.local_data.data.department_code || ''
  this.deleteDepValue=this.local_data?.data.department_name || ''
  this.dependencies={...data.dependencies}
}
onCancel()
{
  this.dialogRef.close();
}
delete(){
     this._orgService.deleteDepartment(this.depCode).subscribe({
      next:(data:any)=>{
         this._healthnableCoreService.apiSuccess(`${this.depCode} - ${data.data.message}`);
       this.dialogRef.close('delete');
        this.cdr.detectChanges(); 
      }
    })
   }
}
@Component({
  selector: 'healthnable-delete-facility',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule,CommonModule],
  templateUrl: 'delete-facility.component.html',
  styleUrl: 'delete-dialog.component.scss'
})

export class DeleteFacComponent {

tags:any
dependencies!:boolean
local_data: any;
facCode:any
deleteFacValue!:string;
constructor(private translate: TranslateService,private _orgService:OrganizationService,
  public dialogRef: MatDialogRef<DeleteFacComponent>, 
  private cdr: ChangeDetectorRef,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  private _healthnableCoreService:HealthnableCoreService){
 this.local_data = { ...data.obj }
  this.tags = { ...data.tags }
  this.facCode=this.local_data.data.facility_code || ''
  this.deleteFacValue=this.local_data?.data.facility_name || ''
  this.dependencies={...data.dependencies}
}
onCancel()
{
  this.dialogRef.close();
}
delete(){
    this._orgService.deleteFacility(this.facCode).subscribe({
      next:(data:any)=>{
         this._healthnableCoreService.apiSuccess(`${this.facCode} - ${data.data.message}`);
       this.dialogRef.close('delete');
        this.cdr.detectChanges(); 
      }
    })
  
}
}
@Component({
  selector: 'healthnable-delete-org',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule,CommonModule],
  templateUrl: 'delete-org.component.html',
  styleUrl: 'delete-dialog.component.scss'
})

export class DeleteOrgComponent{

tags:any
dependencies!:boolean
local_data: any;
orgCode:any
deleteOrgValue!:string;
constructor(private translate: TranslateService,private _orgService:OrganizationService,
  public dialogRef: MatDialogRef<DeleteOrgComponent>, 
  private cdr: ChangeDetectorRef,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  private _healthnableCoreService:HealthnableCoreService){
 this.local_data = { ...data.obj }
  this.tags = { ...data.tags }
  this.orgCode=this.local_data.data.organization_code
  this.deleteOrgValue=this.local_data?.data.organization_name || ''
  this.dependencies={...data.dependencies}
}

onCancel()
{
  this.dialogRef.close();
}
delete(){

this._orgService.deleteOrg(this.orgCode).subscribe({
  next:(data:any)=>{
      this._healthnableCoreService.apiSuccess(`${this.orgCode} -${data.data.message}`);
       this.dialogRef.close('delete');
        this.cdr.detectChanges();
  }
}) 
}
}
@Component({
  selector: 'healthnable-delete-dashboard',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule,CommonModule],
  templateUrl: 'delete-dashboard.component.html',
  styleUrl: 'delete-dialog.component.scss'
})

export class DeleteDashboardComponent{

tags:any
dependencies!:boolean
local_data: any;
dashboardCode:any
deletedashValue!:string;
constructor(private translate: TranslateService,
  public dialogRef: MatDialogRef<DeleteDashboardComponent>, 
  private cdr: ChangeDetectorRef,@Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  private _dashboardService:DashboardService,
  private _healthnableCoreService:HealthnableCoreService){
 this.local_data = { ...data.obj }
  this.tags = { ...data.tags }
     this.deletedashValue=this.local_data?.data.dashboard_name || ''
  this.dashboardCode=this.local_data?.data.dashboard_code || ''
  this.dependencies={...data.dependencies}
}
onCancel()
{
  this.dialogRef.close();
}
delete(){
  if(this.dashboardCode){
this._dashboardService.deleteDashboard(this.dashboardCode).subscribe({
  next:(data:any)=>{
      this._healthnableCoreService.apiSuccess(data.data.message);
       this.dialogRef.close('delete');
        this.cdr.detectChanges();
  }
})
  }

    
  
}
}
@Component({
  selector: 'healthnable-delete-role',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule,CommonModule],
  templateUrl: 'delete-role.component.html',
  styleUrl: 'delete-dialog.component.scss'
})

export class DeleteRoleComponent {

tags:any
dependencies!:boolean
local_data: any;
role_id:any;
deleteRoleName!:string;
constructor(private translate: TranslateService,
  public dialogRef: MatDialogRef<DeleteRoleComponent>, 
  private cdr: ChangeDetectorRef, private _identitymanagementService:IdentityManagementService,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  private _healthnableCoreService:HealthnableCoreService){
 this.local_data = { ...data.obj }
  this.tags = { ...data.tags }
  this.role_id=this.local_data.data?.role_id || ''
    this.deleteRoleName=this.local_data?.data.role_name || ''
  this.dependencies={...data.dependencies}
}

onCancel()
{
  this.dialogRef.close();
}
delete(){

     this._identitymanagementService.deleteRole(this.role_id).subscribe({
      next:(data:any)=>{
         this._healthnableCoreService.apiSuccess(`${this.role_id} - ${data.message}`);
       this.dialogRef.close('delete');
        this.cdr.detectChanges(); 
      }
    })
   }
}
@Component({
  selector: 'healthnable-delete-user',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule,CommonModule],
  templateUrl: 'delete-user.component.html',
  styleUrl: 'delete-dialog.component.scss'
})

export class DeleteUserComponent implements OnInit{

tags:any
dependencies!:boolean
local_data: any;
user_id:any;
deleteUserName!:string

constructor(private translate: TranslateService,
  public dialogRef: MatDialogRef<DeleteUserComponent>, 
  private cdr: ChangeDetectorRef, private _identitymanagementService:IdentityManagementService,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  private _healthnableCoreService:HealthnableCoreService){
 this.local_data = { ...data.obj }
  this.tags = { ...data.tags }
  this.user_id=this.local_data.data?.user_id || ''
  this.dependencies={...data.dependencies}
}
ngOnInit(): void {
  this.user_id=this.local_data.data?.user_id || ''
  this.deleteUserName=`${this.local_data.data.first_name} ${this.local_data.data.last_name}`;
}
onCancel()
{
  this.dialogRef.close();
}
delete(){
     this._identitymanagementService.deleteUser(this.user_id).subscribe({
      next:(data:any)=>{
         this._healthnableCoreService.apiSuccess(`${this.user_id} - ${data.data.message}`);
       this.dialogRef.close('delete');
        this.cdr.detectChanges(); 
      }
    })
}
}
@Component({
  selector: 'healthnable-delete-kpi',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule,CommonModule],
  templateUrl: 'delete-kpi.component.html',
  styleUrl: 'delete-dialog.component.scss'
})

export class DeleteKpiComponent {
tags:any
dependencies!:boolean
local_data: any;
kpiCode :any
deletekpiValue!:string;
constructor(private translate: TranslateService,private _orgService:OrganizationService,
  public dialogRef: MatDialogRef<DeleteDialogComponent>, 
  private cdr: ChangeDetectorRef, private _identitymanagementService:IdentityManagementService,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: any,private _dashboardService:DashboardService,
  private _healthnableCoreService:HealthnableCoreService){
 this.local_data = { ...data.obj }
  this.tags = { ...data.tags }
  this.kpiCode=this.local_data.data.kpi_id || ''
  this.deletekpiValue=this.local_data.data.kpi_name
  this.dependencies={...data.dependencies}
}

onCancel()
{
  this.dialogRef.close();
}
delete(){
     this._dashboardService.deleteKPI(this.kpiCode).subscribe({
      next:(data:any)=>{
         this._healthnableCoreService.apiSuccess(`${this.kpiCode} - ${data.message}`);
       this.dialogRef.close('delete');
        this.cdr.detectChanges(); 
      }
    })
   }
  
}

@Component({
  selector: 'healthnable-delete-roleBased',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule,CommonModule],
  templateUrl: 'delete-roleBased.component.html',
  styleUrl: 'delete-dialog.component.scss'
})
export class DeleteRoleBasedComponent implements OnInit{

tags:any
dependencies!:boolean
local_data: any;
roleBasedId:any
deleteroleBasedName!:string
constructor(private translate: TranslateService,private _orgService:OrganizationService,
  public dialogRef: MatDialogRef<DeleteDialogComponent>, 
  private cdr: ChangeDetectorRef, private _identitymanagementService:IdentityManagementService,
  @Optional() @Inject(MAT_DIALOG_DATA) public data: any,private _dashboardService:DashboardService,
  private _healthnableCoreService:HealthnableCoreService){
 this.local_data = { ...data.obj }
  this.tags = { ...data.tags }
 this.roleBasedId=this.local_data.data?._id || ''
  this.deleteroleBasedName=this.local_data?.data.role_name || ''
  this.dependencies={...data.dependencies}
}
ngOnInit(): void {
}
onCancel()
{
  this.dialogRef.close();
}
delete(){
     this._dashboardService.deleteRoleBased(this.roleBasedId).subscribe({
      next:(data:any)=>{
         this._healthnableCoreService.apiSuccess(`${this.roleBasedId} - ${data.message}`);
       this.dialogRef.close('delete');
        this.cdr.detectChanges(); 
      }
    })
   }
}

@Component({
  selector: 'healthnable-delete-attribute',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule],
  templateUrl: 'delete-attribute-template.component.html',
  styleUrl: 'delete-dialog.component.scss'
})
export class DeleteattributetemplateComponent {
 tags:any
 headers: any = ["Template Name","Description", "Attributes Count", "Used in Categories","Used in Workflows"]
constructor(private translate: TranslateService,public dialogRef: MatDialogRef<DeleteattributetemplateComponent>){
  translate.get('attributes').subscribe((tags: string) => { this.tags = tags });
}
onCancel()
{
  this.dialogRef.close();

}
}
@Component({
  selector: 'healthnable-delete-attribute',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule],
  templateUrl: 'delete-attribute.component.html',
  styleUrl: 'delete-dialog.component.scss'
})
export class DeleteattributeComponent {
  tags:any
  constructor(private translate: TranslateService,public dialogRef: MatDialogRef<DeleteattributeComponent>){
    translate.get('attributes').subscribe((tags: string) => { this.tags = tags });
  }
  onCancel()
  {
    this.dialogRef.close();
  
  }
}
@Component({
  selector: 'healthnable-delete-entity',
  standalone: true,
  imports: [MaterialModule,TranslateModule,FeatherModule,HeaderComponent],
  templateUrl: 'delete-entity.component.html',
  styleUrl: 'delete-dialog.component.scss'
})
export class DeleteEntityComponent {
 tags:any
 dependencies:boolean=true
 headers: any = ["Entity Name","Entity Code", "category", "status"]
 subheaders:any=['Workflow', 'Form', 'Report']
constructor(private translate: TranslateService, private router:Router){
  translate.get('entity').subscribe((tags: string) => { this.tags = tags });
}
onCancel()
{
  this.router.navigate(['entities/entity'])
}
}
