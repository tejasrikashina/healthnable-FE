import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BrandingComponent } from './branding.component';
import { CoreService } from '../../../../services/core.service';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { MaterialModule } from '../../../../material/material.module';

@Component({
  selector: 'healthnable-sidebar',
  standalone: true,
  imports: [BrandingComponent,CommonModule, FeatherModule, MaterialModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  settings=inject(CoreService)
  options = this.settings.getOptions();
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
}
