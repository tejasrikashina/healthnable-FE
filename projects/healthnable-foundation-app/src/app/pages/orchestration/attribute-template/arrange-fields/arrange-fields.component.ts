import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { HeaderComponent } from '../../../../layouts/full/vertical/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeNGModule } from '../../../../material/primeng.module';
import {CdkDrag} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
@Component({
  selector: 'app-arrange-fields',
  standalone: true,
  imports: [MaterialModule,HeaderComponent,TranslateModule,PrimeNGModule,CdkDrag],
  templateUrl: './arrange-fields.component.html',
  styleUrl: './arrange-fields.component.scss'
})
export class ArrangeFieldsComponent {
  constructor(private router:Router){}
  preview() {
    this.router.navigate(['/orchestration/preview-template'])
  }
  onCancel() {
    this.router.navigate(['/orchestration/template'])
 }
}
