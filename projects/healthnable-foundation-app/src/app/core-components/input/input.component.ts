import { Component, forwardRef, Input } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { PrimeNGModule } from '../../material/primeng.module';

@Component({
  selector: 'healthnable-input',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule,FormsModule,TranslateModule,PrimeNGModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    }
  ]
})
export class InputComponent {
  @Input() formControlName: any; 
  @Input() input:any
  @Input() formGroupValue!: FormGroup;
  @Input() label!:string;
  @Input() variant!:any;
  @Input() required!:boolean;
  @Input() buttonDis!:boolean;

  @Input() dashboard!:boolean;
  @Input() smallText!:boolean;
  @Input() icon!:boolean;
  @Input() invalidCharactersaddress!:boolean;
  @Input() firstCharacterInvalid!:boolean
  @Input() firstCharAlpabetsandNumbers!: boolean;
  @Input() formArrayNamed!:string;
  @Input() name!:string;
  @Input() maximum!:number;
  @Input() minimum!:number;
  @Input() patternValue!:string;
  @Input() type!:string;
  @Input() placeholder: string = '';
  @Input() readonly :any
  @Input() style:any
  
  constructor() {}
  writeValue(_obj: any): void {}
  registerOnChange(_fn: any): void {}
  registerOnTouched(_fn: any): void {}
  setDisabledState?(_isDisabled: boolean): void {}
  logError(controlName: string,error:string): void {
  }
}
