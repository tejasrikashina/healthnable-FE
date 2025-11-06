import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { StatusComponent } from '../../../../core-components/status/status.component';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../../../services/dashboard.service';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';

@Component({
  selector: 'app-edit-dashboard',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderComponent,
    TranslateModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    StatusComponent,
    TextAreaComponent,
  ],
  templateUrl: './edit-dashboard.component.html',
  styleUrl: './edit-dashboard.component.scss',
})
export class EditDashboardComponent implements OnInit {
  dashboardCode: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _dashboardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private _dashboardSer: DashboardService,
    private _healthnableCoreService: HealthnableCoreService
  ) {
    this.activatedRoute.params.subscribe((param: any) => {
      this.dashboardCode = param['dashboardCode'];
      this.getDashboardDetails();
    });
  }
  dashboardForm!: FormGroup;
  status!: boolean;

  categoryValue!: any[];
  themeValue!: any[];
  ngOnInit() {
    this.dashboardForm = this.fb.group({
      dashboard_name: ['', [Validators.required]],
       description:['',[ Validators.maxLength(1000)]],
      dashboard_type: ['', [Validators.required]],
      theme: ['', [Validators.required]],
      status: [true],
    });
    this.getdashType();
    this.getthemeValue();
    forkJoin({
    categories: this._dashboardService.getDashboardType(),
    themes: this._dashboardService.getThemes()
  }).subscribe({
    next: ({ categories, themes }) => {
      this.categoryValue = categories.data.map((item: any) => item);
      this.themeValue = themes.themes;
      this.getDashboardDetails();
    },
    error: (err) => {
      console.error('Failed to load categories or themes', err);
    }
  });
  }
  onCancel() {
    this.router.navigate(['/dashboards/dashboard']);
  }
  onStatusChange(): void {
    this.status = this.dashboardForm.get('status')?.value;
  }
  getDashboardDetails() {
    this._dashboardSer.getDashboardByCode(this.dashboardCode).subscribe({
      next: (data: any) => {
        if (data) {
          const dashboardData = data.data;
          const dashboardName = dashboardData.dashboard_name;
          const Description = dashboardData.description;
          const statusValue = dashboardData.status.toLowerCase() === 'active';
          const selectedCategory = this.categoryValue.find(
          (cat: any) => cat.dashboard_type === dashboardData.dashboard_type
        );

        const selectedTheme = this.themeValue.find(
          (theme: any) => theme.key === dashboardData.theme
        );
          this.dashboardForm.patchValue({
            dashboard_name: dashboardName,
            description: Description,
            dashboard_type: selectedCategory || null,
          theme: selectedTheme || null,
            status: statusValue,
          });
        }
      },
    });
  }
  editDashboard() {
    if (this.dashboardForm.invalid) {
      this._healthnableCoreService.apiWarning('Kindly enter valid information');
    } 
    else {
      const formValue = { ...this.dashboardForm.value };
      formValue.dashboard_type = formValue.dashboard_type?.dashboard_type || ''
      formValue.theme = formValue.theme?.key || '';
      formValue.status = formValue.status ? 'Active' : 'Inactive';

      this._dashboardSer.updateDashboard(this.dashboardCode, formValue)
        .subscribe({
          next: (data: any) => {
            this._healthnableCoreService.apiSuccess(data.data.message);
            this.router.navigate(['/dashboards/dashboard']);
          },
        });
    }
  }
getdashType(){
this._dashboardService.getDashboardType().subscribe({
  next:(data:any)=>{
this.categoryValue=data.data.map((item: any) => item);
  }
})
}
  getthemeValue() {
    this._dashboardService.getThemes().subscribe({
      next: (data: any) => {
        this.themeValue = data.themes;
      },
    });
  }
}
