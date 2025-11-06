import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '../../../core-components/table/table.component';
import { HeaderComponent } from '../../../layouts/full/vertical/header/header.component';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-attribute-dependency',
  standalone: true,
  imports: [TableComponent,MaterialModule,TranslateModule, HeaderComponent],
  templateUrl: './attribute-dependency.component.html',
  styleUrl: './attribute-dependency.component.scss'
})
export class AttributeDependencyComponent {
displayedColumns=['attributeName','code','dependencytype','dependentattribute']

}
