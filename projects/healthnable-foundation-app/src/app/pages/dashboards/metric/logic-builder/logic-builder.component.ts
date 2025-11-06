import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { MatDialog } from '@angular/material/dialog';
import { AddOperandComponent } from './add-operand/add-operand.component';
import { AddFilterComponent } from './add-filter/add-filter.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EditOperandComponent } from './edit-operand/edit-operand.component';
import { DashboardService } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-logic-builder',
  standalone: true,
  imports: [MaterialModule,ReactiveFormsModule,HeaderComponent,TranslateModule,ReactiveFormsModule,SelectComponent,PrimeNGModule],
  templateUrl: './logic-builder.component.html',
  styleUrl: './logic-builder.component.scss'
})
export class LogicBuilderComponent implements OnInit{
  constructor(private fb:FormBuilder,private dashService:DashboardService,  
        private activatedRoute: ActivatedRoute,  private dialog: MatDialog, private router:Router,
  ){
       this.activatedRoute.paramMap.subscribe(params => {
      this.dataset = decodeURIComponent(params.get('dataset') || '');
    });
  
  }
  logicBuildForm!:FormGroup
 operator!: any[];
dataset:any
  fieldVal: { name: string; value: string }[] = [];
fieldValue!:any[]
    value=[
    { name: 'Today' },
    {name:'All Sites'},
    ]

  selectedFields: { name: string, value: string }[] = [];
  availableFieldOptions: { name: string, value: string }[] = [];

  headers: string[] = ["Dataset in Use", "Available Fields"];
rows: { [key: string]: string }[] = [];
 ngOnInit() {
    this.logicBuildForm = this.fb.group({
      operator: [''],
      field:[''],
      value:[''],
      field1: [[]]
    });
    this.getOperators()
    this.getFields()
    this.getDatasets()
     const defaultFields : any[]=[]; 
    defaultFields.forEach(field => {
      this.logicBuildForm.addControl(field, new FormControl(false));
    });

     this.selectedFields = this.fieldVal.filter(f => defaultFields.includes(f.value));
    this.updateAvailableFieldOptions();

    this.logicBuildForm.get('field1')?.valueChanges.subscribe((newSelections: string[]) => {
      // Handle additions
      newSelections.forEach(val => {
        const field = this.fieldVal.find(f => f.value === val);
        if (field && !this.selectedFields.find(f => f.value === val)) {
          this.selectedFields.push(field);
          this.logicBuildForm.addControl(val, new FormControl(false));
        }
      });
       const currentValues = this.selectedFields.map(f => f.value);
      currentValues.forEach(val => {
        if (!newSelections.includes(val)) {
          this.selectedFields = this.selectedFields.filter(f => f.value !== val);
          this.logicBuildForm.removeControl(val);
        }
      });

      this.updateAvailableFieldOptions();
    });
  }


updateAvailableFieldOptions() {
    const selectedValues = this.selectedFields.map(f => f.value);
    this.availableFieldOptions = this.fieldVal.filter(f => !selectedValues.includes(f.value));
  }
  reset(){
    this.logicBuildForm.reset();
    this.selectedFields = [];
  }
  addOperand(){
     let dialogRef = this.dialog.open(AddOperandComponent, {
             maxWidth:'800px',
            disableClose: true,
          });
          dialogRef.afterClosed().subscribe((res: any) => {
       
          });
  }
 edit(){
   let dialogRef = this.dialog.open(EditOperandComponent, {
             maxWidth:'700px',
            disableClose: true,
          });
          dialogRef.afterClosed().subscribe((res: any) => {
       
          });
 }
  onCancel(){
    this.router.navigate(['dashboards/kpi'])
  }
  addFilter(){
         let dialogRef = this.dialog.open(AddFilterComponent, {
             maxWidth:'700px',
            disableClose: true,
          });
          dialogRef.afterClosed().subscribe((res: any) => {
       
          });
  }
  getOperators(){
     this.dashService.getAllOperator().subscribe({
      next:(data:any)=>{
this.operator=data.data.map((item: any) => item);
      }
    })
  }
  getFields(){
         this.dashService.getAllFields().subscribe({
      next:(data:any)=>{
this.fieldValue=data.data
   this.fieldVal = (data.data || []).map((field: string) => ({
          name: field,
          value: field
        }));
        this.updateAvailableFieldOptions();
}
    })
  }
  matchedDataset:any
  getDatasets(){
    this.dashService.getAllDatasets().subscribe({
      next:(data:any)=>{
           const datasets = data.data || [];
            this.matchedDataset = datasets.find((d: any) => {
          return d.dataset_name === this.dataset
        
        });
           if (this.matchedDataset) {
        this.rows = [{
          'Dataset in Use': this.matchedDataset.dataset_name,
          'Available Fields': Array.isArray(this.matchedDataset.attributes)
            ? this.matchedDataset.attributes.join(', ')
            : this.matchedDataset.attributes || 'N/A'
        }];
      } else {
        this.rows = []; 
      }
      }
    })
  }
}
