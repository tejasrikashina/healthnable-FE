import { Component, forwardRef, Input } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { PrimeNGModule } from '../../material/primeng.module';
import { FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'healthnable-calendar',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, FormsModule, TranslateModule,PrimeNGModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CalendarComponent),
        multi: true,
      }
    ]
})
export class CalendarComponent {
    @Input() label!:string;
    @Input() formControlName: any;
    @Input() formGroupValue!: FormGroup;
    @Input() required!: boolean;
    @Input() smallText!: boolean;
    @Input() selectedId:any;
    @Input() placeholder:string ='';
    @Input() name!:string;
    @Input() readonly !:boolean
    writeValue(_obj: any): void {}
    registerOnChange(_fn: any): void {}
    registerOnTouched(_fn: any): void {}
    setDisabledState?(_isDisabled: boolean): void {}
}
