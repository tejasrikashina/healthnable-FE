import { NgModule } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputOtpModule } from 'primeng/inputotp';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { SplitButtonModule } from 'primeng/splitbutton';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DragDropModule } from 'primeng/dragdrop';
import { PickListModule } from 'primeng/picklist';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
  declarations: [],
  imports:[],
  exports: [
    DropdownModule,
    InputTextModule,
    ChartModule,
    AccordionModule,
    MenuModule,
    ToastModule,
    ButtonModule,
    SplitButtonModule,
    CardModule,
    InputSwitchModule,
    InputOtpModule,
    RadioButtonModule,
    CheckboxModule,
    InputTextareaModule,
    CalendarModule,
    TieredMenuModule,
    ChipModule,
    MultiSelectModule,
    DragDropModule,
    PickListModule,
    OverlayPanelModule,
    ConfirmDialogModule,
    FileUploadModule
  ],
})
export class PrimeNGModule {}
