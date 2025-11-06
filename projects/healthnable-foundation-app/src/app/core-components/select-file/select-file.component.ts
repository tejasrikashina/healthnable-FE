import { Component, forwardRef, Input } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import {
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HealthnableCoreService } from '../healthnable-core.service';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'healthnable-select-file',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './select-file.component.html',
  styleUrl: './select-file.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectFileComponent),
      multi: true,
    },
  ],
})
export class SelectFileComponent {
  constructor(private _healthnableCoreService: HealthnableCoreService) {}
    writeValue(_obj: any): void {}
  registerOnChange(_fn: any): void {}
  registerOnTouched(_fn: any): void {}
  setDisabledState?(_isDisabled: boolean): void {}
  @Input() acceptValue!: string;
  @Input() fileType!: string;
  @Input() imgFileName!: string;
  @Input() imageData!: boolean;
  @Input() imageUpload!: boolean;
  @Input() required!: boolean;
  @Input() label!: string;
  @Input() formControlName: any;
  @Input() formGroupValue!: FormGroup;
  previewUrl: string | null = null;
  handleFileInput(files: any) {
 
    if (files.length > 0) {
      const mimeType = files[0].type;
      if (files[0].size > 2097152) {
        this._healthnableCoreService.apiWarning(
          'Image size should be less than 2MB'
        );
        this.imgFileName = 'No Image Chosen';
        return;
      }

      if (!mimeType.match(/^image\//)) {
        this._healthnableCoreService.apiWarning('Not an image file');
        this.imgFileName = 'No Image Chosen';
          this.previewUrl = null;
        return;
      }

      this.imgFileName = files[0].name;
       this.readImage(files[0]).subscribe({
      next: (result: string) => {
        this.previewUrl = result;
        const obj = {
          imageFile: files[0],
          imageType: mimeType,
          imageName: files[0].name,
          imageUrl: result,
        };
        this._healthnableCoreService.imageData.next(obj);
      },
      error: () => {
        this._healthnableCoreService.apiWarning('Error reading image');
        this.previewUrl = null;
      },
    });
    } else {
      // No file selected
      this.imageUpload = false; // No image uploaded
      this.imgFileName = 'No Image Chosen';
    }
  }
  readImage(file: File): Observable<string> {
    return new Observable((observer: Observer<string>) => {
      const reader = new FileReader();
      reader.onload = () => {
        observer.next(reader.result as string);
        observer.complete();
      };
      reader.onerror = () => {
        observer.error('Error reading file');
      };
      reader.readAsDataURL(file);
        if (this.formGroupValue && this.formControlName) {
      this.formGroupValue.get(this.formControlName)?.setValue(file);
    }
    });
  }
  fileInput(ev: any) {
    let file: FileList = ev.target.files;
  }
}
