import { Component, Input, forwardRef } from '@angular/core';
import { FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeNGModule } from '../../material/primeng.module';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'healthnable-select',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule,CommonModule, FormsModule, TranslateModule,PrimeNGModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    }
  ]
})
export class SelectComponent {
  @Input() label!:string;
  @Input() options:any;
  @Input() optionLabel:any;
  @Input() readonly :any
  @Input() name!:string;
  @Input() filter!:boolean
  @Input() formControlName: any;
  @Input() formGroupValue!: FormGroup;
  @Input() required!: boolean;
  @Input() multiSelect!:boolean
  @Input() buttonDis!:boolean 
  @Input() icon!: boolean;
  @Input() variant!: any;
  @Input() smallText!: boolean;
  @Input() noLabel!:boolean
  @Input() selectedItem:any;
  @Input() selectedId:any;
  @Input() placeholder:string ='';
  constructor(){}
  writeValue(_obj: any): void {}
  registerOnChange(_fn: any): void {}
  registerOnTouched(_fn: any): void {}
  setDisabledState?(_isDisabled: boolean): void {}
  
 
}
