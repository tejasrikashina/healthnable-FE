import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import {  Router } from '@angular/router';
import { DashboardService } from '../../../../services/dashboard.service';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { dashboardData } from '../../../../type-models/dashboard';
import Swal from 'sweetalert2';
@Component({
  selector: 'healthnable-add-dashboard',
  standalone: true,
  imports: [MaterialModule,HeaderComponent,TranslateModule,ReactiveFormsModule,InputComponent,SelectComponent,StatusComponent,TextAreaComponent],
  templateUrl: './add-dashboard.component.html',
  styleUrl: './add-dashboard.component.scss'
})
export class AddDashboardComponent implements OnInit{

  constructor(private fb:FormBuilder, private router:Router,
    private _dashboardService:DashboardService, private _healtnableCoreService:HealthnableCoreService){}
  dashboardForm!:FormGroup
  status!:boolean;

 categoryValue!: any[];
  themeValue !:any[]
  ngOnInit() {
    this.dashboardForm = this.fb.group({
      dashboard_name:['' ,[Validators.required, Validators.minLength(3),
          Validators.maxLength(70),Validators.pattern(this._healtnableCoreService.regEx.userName)]],
      description:['',[ Validators.maxLength(1000)]],
      dashboard_type:['', [Validators.required]],
      theme:[''],
      status:[true],
  })  
  this.getdashType()
  this.getthemeValue()
  }
  onCancel() {
    this.router.navigate(['/dashboards/dashboard'])
 }
 onStatusChange(): void {
  this.status = this.dashboardForm.get('status')?.value;
}
addDashboard(){
   if (this.dashboardForm.valid ){
        const rawValue = this.dashboardForm.value;
        const transformedEntry: dashboardData = {
          ...rawValue,
          dashboard_type: rawValue.dashboard_type?.dashboard_type || '',
           theme: rawValue.theme?.key || '',
           status: rawValue.status ? 'Active' : 'Inactive'
        }
this._dashboardService.addDashboard(transformedEntry).subscribe({
  next:(data:any)=>{
        this.dashboardForm.reset();
          this._healtnableCoreService.apiSuccess(`${data.data.dashboard_code} - ${data.message}`);
            this.dashboardForm.reset();
 this.router.navigate(['/dashboards/dashboard'])
  }
})
   }
}
  addNewDashboard(){
    if (this.dashboardForm.valid ){
          const rawValue = this.dashboardForm.value;
          const transformedEntry: dashboardData = {
            ...rawValue,
            dashboard_name:rawValue.dashboard_name || '',
            dashboard_type: rawValue.dashboard_type?.dashboard_type || '',
            theme: rawValue.theme?.key || '',
            status: rawValue.status ? 'Active' : 'Inactive'
          }
  this._dashboardService.addDashboard(transformedEntry).subscribe({
    next:(data:any)=>{
    
     this._healtnableCoreService.apiSuccess(`${data.data.dashboard_code} - ${data.message}`);
       
           
             this.dashboardForm.reset({
          status: true
        });
      this.router.navigate(['/dashboards/dashboard/add-dashboard'])
  
    }
  })
    }
  }
getdashType(){
this._dashboardService.getDashboardType().subscribe({
  next:(data:any)=>{
this.categoryValue=data.data.map((item: any) => item);
  }
})
}
 onDashboardNameChange(event: any): void {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[0-9]/g, ''); 
    inputValue = inputValue.replace(/[^a-zA-Z'\- ]/g, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    inputValue = inputValue.trimStart();
    this.dashboardForm.get('dashboard_name')?.setValue(inputValue, { emitEvent: false });
  }
getthemeValue(){
  this._dashboardService.getThemes().subscribe({
    next:(data:any)=>{
     this.themeValue=data.themes
    }
  })
}
}
