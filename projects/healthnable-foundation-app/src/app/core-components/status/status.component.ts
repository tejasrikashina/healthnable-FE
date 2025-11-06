import { Component, forwardRef, Input } from '@angular/core';
import { FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from '../select/select.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { PrimeNGModule } from '../../material/primeng.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'healthnable-status',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, FormsModule, TranslateModule,PrimeNGModule,CommonModule],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss',
   providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => StatusComponent),
        multi: true,
      }
    ]
})
export class StatusComponent {
    @Input() label!:string;
    @Input() status!:boolean;
    @Input() disabled!:boolean;
      @Input() readonly :any;
    @Input() formControlName: any;
    @Input() statusChange:any;
    @Input() formGroupValue!: FormGroup;
    @Input() required!: boolean;
 
  writeValue(_obj: any): void {}
  registerOnChange(_fn: any): void {}
  registerOnTouched(_fn: any): void {}
  setDisabledState?(_isDisabled: boolean): void {}
  
 
}
