import { Component, forwardRef, Input } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { PrimeNGModule } from '../../material/primeng.module';
import { FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'healthnable-checkbox',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule,FormsModule,TranslateModule,PrimeNGModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
   providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CheckboxComponent),
        multi: true,
      }
    ]
})
export class CheckboxComponent {
  @Input() formControlName: any; 
  @Input() input:any
  @Input() formGroupValue!: FormGroup;
  @Input() label!:string;
  @Input() selectedId:any;
  @Input() required!:boolean;
  @Input() name!:string;
  @Input() value:any
  writeValue(_obj: any): void {}
  registerOnChange(_fn: any): void {}
  registerOnTouched(_fn: any): void {}
  setDisabledState?(_isDisabled: boolean): void {}
}

