import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, Output, signal, ViewChild } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { MaterialModule } from '../../material/material.module';
import { SidebarComponent } from './vertical/sidebar/sidebar.component';
import { NavItemComponent } from './vertical/sidebar/nav-item/nav-item.component';
import { RouterModule } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { navItems } from './vertical/sidebar/sidebar-data';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { AppSettings } from '../../services/core';
import { PrimeNGModule } from '../../material/primeng.module';
import { NavService } from '../../services/nav.service';
const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';
@Component({
  selector: 'healthnable-full',
  standalone: true,
  imports: [MaterialModule, SidebarComponent,CommonModule, PrimeNGModule,
     NavItemComponent, RouterModule,NgScrollbarModule],
  templateUrl: './full.component.html',
  styleUrl: './full.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
})
export class FullComponent {
  navItems = navItems;
  settings=inject(CoreService)
  sideNavCollapsed=signal(false);
  @Input() set collapsed(val:boolean){
    this.sideNavCollapsed.set(val)
  }
  
  private layoutChangesSubscription = Subscription.EMPTY;
  constructor(
  private navService: NavService, 
    private breakpointObserver: BreakpointObserver
  ) {
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[BELOWMONITOR];

        if (this.options.sidenavCollapsed == false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
        this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
        this.resView = state.breakpoints[BELOWMONITOR];
      });

    // Initialize project theme with options
    this.receiveOptions(this.options);
  }
  options = this.settings.getOptions();

  private isMobileScreen = false;
  resView = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  public sidenav!: MatSidenav;
  private htmlElement!: HTMLHtmlElement;
  get isOver(): boolean {
    return this.isMobileScreen;
  }
  get isTablet(): boolean {
    return this.resView;
  }
  receiveOptions(options: AppSettings): void {
    this.options = options;
    this.toggleDarkTheme(options);
  }
  toggleDarkTheme(options: AppSettings) {
    if (options.theme === 'dark') {
      this.htmlElement.classList.add('dark-theme');
      this.htmlElement.classList.remove('light-theme');
    } else {
      this.htmlElement.classList.remove('dark-theme');
      this.htmlElement.classList.add('light-theme');
    }
  }
  toggleCollapsed() {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }
  resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }
  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }
  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }
  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }
  
}
