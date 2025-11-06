import { Component, forwardRef, Input } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { PrimeNGModule } from '../../material/primeng.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'healthnable-text-area',
  standalone: true,
imports: [MaterialModule, ReactiveFormsModule,FormsModule,TranslateModule,PrimeNGModule,CommonModule],
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.scss',
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TextAreaComponent),
        multi: true,
      }
    ]
})
export class TextAreaComponent {
  @Input() label!:string;
  @Input() rows!:number;
  @Input() cols!:number;
  @Input() formControlName: any;
  @Input() formGroupValue!: FormGroup;
  @Input() required!: boolean;
  @Input() subValue!:boolean;
  @Input() placeholder: string = '';
   @Input() maximum!:number;
   @Input() minimum!:number
  @Input() readonly :any;
  @Input() style:any
  writeValue(_obj: any): void {}
  registerOnChange(_fn: any): void {}
  registerOnTouched(_fn: any): void {}
  setDisabledState?(_isDisabled: boolean): void {}
}
