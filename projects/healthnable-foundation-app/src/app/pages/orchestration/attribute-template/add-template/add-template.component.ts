import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../core-components/input/input.component';
import { SelectComponent } from '../../../../core-components/select/select.component';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../../material/material.module';
import { StatusComponent } from '../../../../core-components/status/status.component';
import {CountryISO, NgxIntlTelInputModule, SearchCountryField}  from 'ngx-intl-tel-input';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { TableComponent } from '../../../../core-components/table/table.component';
import { HealthnableCoreService } from '../../../../core-components/healthnable-core.service';
import { Subscription } from 'rxjs';
import { EditAssignedAttrComponent } from './edit-assigned-attr/edit-assigned-attr.component';
import { MatDialog } from '@angular/material/dialog';
import { TextAreaComponent } from '../../../../core-components/text-area/text-area.component';


@Component({
  selector: 'app-add-template',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderComponent,
    TranslateModule,
    InputComponent,
    SelectComponent,
    StatusComponent,
    ReactiveFormsModule,
    FormsModule,
    PrimeNGModule,
    NgxIntlTelInputModule,
    TableComponent,
    TextAreaComponent
  ],
  templateUrl: './add-template.component.html',
  styleUrl: './add-template.component.scss',
  
})
export class AddTemplateComponent implements OnInit{
  form!: FormGroup;
  selectedCheckboxes: string[] = [];
  preferredCountries: CountryISO[] = [CountryISO.India];
  SearchCountryField = SearchCountryField;
  selectedCountryISO: CountryISO = CountryISO.India;
  CountryISO = CountryISO;
  status!:boolean;
  reactiveKeywords: string[] = [];
    gridEditOptionSubscription!:Subscription;
  displayedColumns=['section', 'attribute','bothaction']
  locationValue = [
    { name: 'Notification' },
    {name:'Form'},
    { name: 'Survey'},
    { name: 'Consent' },
    { name: 'Document' },
    { name: 'Task' },
    { name: 'Campaign' },
  ];
  constructor(private router:Router, private fb:FormBuilder,private dialog:MatDialog,
    private _healthnableCoreService: HealthnableCoreService){}
    ngOnInit(){
      this.assignedAttrList()
    this.form = this.fb.group({
      name:['', [Validators.required]],
      // code:['', [Validators.required]],
      description:['', [Validators.required]],
      categories:['', [Validators.required]],
      type:['', [Validators.required]],
      status:[true],
      section:['', [Validators.required]],
      addAttribute : this.fb.group({
        isAttribute: [false],
        isfirstName: [false],
        isfirstDelDate: [false],
        eduDetails: [false],
        isDob:[false]
      })
    });
    this.gridEditOptionSubscription= this._healthnableCoreService.gridEditOption.subscribe(res=>{
      if(res.tableName === 'assignedAttribute'){
         let dialogRef = this.dialog.open(EditAssignedAttrComponent, { 
                  data: res,
                  maxWidth: '800px' ,
                  disableClose: true
                });
                  dialogRef.afterClosed().subscribe((res: any) => {
                       
                });
      }
    })
  }
  onCancel() {
    this.router.navigate(['/orchestration/template'])
 }
 onStatusChange(): void {
  this.status = this.form.get('status')?.value;
}
onCheckboxChange(label: string, isChecked: boolean) {
  if (isChecked) {
    this.selectedCheckboxes.push(label);
     this.reactiveKeywords = [...this.selectedCheckboxes];
  } else {
    const index = this.selectedCheckboxes.indexOf(label);
    if (index > -1) {
      this.selectedCheckboxes.splice(index, 1);
    }
  }
}
preview() {
  this.router.navigate(['/orchestration/preview-template'])
}
arrangeFields(){
  this.router.navigate(['/orchestration/arrange-fields'])
}
addChips() {
  this.reactiveKeywords = [...this.selectedCheckboxes];

}
onReset() {
  this.form.get('addAttribute')?.reset();
}
dataList=
[
  {
      "section": "Education Details",
      "attribute": "First Name,DOB",
  },
  {
      "section": "Education Details",
      "attribute": "collegeName",
  }
]
assignedAttrList(){
  this._healthnableCoreService.tableData.next(this.dataList);    
}

ngOnDestroy() {
   
  if(this.gridEditOptionSubscription){
    this.gridEditOptionSubscription.unsubscribe();
  }
}
}
