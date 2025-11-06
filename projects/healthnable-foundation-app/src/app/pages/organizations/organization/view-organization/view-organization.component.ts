import { Component, Inject, Optional } from '@angular/core';
import { MaterialModule } from '../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-organization',
  standalone: true,
  imports: [MaterialModule, TranslateModule],
  templateUrl: './view-organization.component.html',
  styleUrl: './view-organization.component.scss'
})
export class ViewOrganizationComponent {
local_data: any;
 headers: string[] = [
    'Organization Code',
    'Organization Name',
    'Address Line 1',
    'Address Line 2',
    'City',
    'State',
    'Country',
    'Zip Code',
    'Phone Number',
    'Time Zone',
    'Primary Contact',
    'Contact Email',
    'Default language',
    'Status',
    'Logo',
    'Favicon',
    'Notes/Description'
  ];
  rows: { [key: string]: string }[] = [];
  constructor(public dialogRef: MatDialogRef<ViewOrganizationComponent>, @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
 this.local_data = { ...data }
  this.rows = [
      
    {
      'Organization Code': this.local_data.organization_code || '-',
      'Organization Name': this.local_data.organization_name || '-',
      "Address Line 1": this.local_data.address_line1 || '-',
      "Address Line 2":this.local_data.address_line2 || '-',
      "City": this.local_data.city || '-',
      'State':this.local_data.state || '-',
      'Country': this.local_data.country || '-',
      'Zip Code': this.local_data.zipcode || '-',
      'Phone Number': this.local_data.phone_number || '-',
      'Time Zone': this.local_data.timezone || '-',
      'Primary Contact':this.local_data.primary_contact || '-',
      'Contact Email': this.local_data.contact_email || '-',
      'Default language':this.local_data.default_language || '-',
      'Status': this.local_data.status || '-',
      "Logo": this.local_data.logo || '-',
      'Favicon': this.local_data.favicon || '-',
      'Notes/Description': this.local_data.description || '-'
      
    },
  ];
  }

 

  onCancel() {
    this.dialogRef.close();
  }
}
