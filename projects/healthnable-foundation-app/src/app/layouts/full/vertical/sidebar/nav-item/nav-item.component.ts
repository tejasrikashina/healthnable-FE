import { Component, EventEmitter, HostBinding, input, Input, OnInit, Output, signal } from '@angular/core';
import { MaterialModule } from '../../../../../material/material.module';
import { NavItem } from './nav-item';
import { Router, RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { PrimeNGModule } from '../../../../../material/primeng.module';
import { NavService } from '../../../../../services/nav.service';

@Component({
  selector: 'healthnable-nav-item',
  standalone: true,
  imports: [MaterialModule, TranslateModule, CommonModule,FeatherModule, PrimeNGModule,RouterModule],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ]),
    // trigger('indicatorRotate',[
    //   transition(':enter',[
    //     style({opacity:0,height:'0px'}),
    //     animate('500ms ease-in-out',style({opacity:1,height:'*'}))
    //   ]),
    //   transition(':leave',[
    //     style({opacity:0,height:'0px'}),
    //     animate('500ms ease-in-out',style({opacity:0,height:'0px'}))
    //   ]),
    // ])
  ],
})
export class NavItemComponent {
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();
  expanded: any = false;
  id?: number ;
  @Input() item: NavItem | any;
  @Input() depth: any;
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
nestedMenuOpen=  signal (false)
@Input() collapsed=false
@HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;


constructor(public navService: NavService, public router: Router) {
  if (this.depth === undefined) {
    this.depth = 0;
  }
}
  ngOnChanges() {
    this.navService.currentUrl.subscribe((url: string) => {
      if (this.item.route && url) {
        this.url = url
        this.expanded = url.indexOf(`/${this.item.route}`) === 0;
        this.ariaExpanded = this.expanded;
      }
    });
  }
  url: any
  isActive(item: NavItem): boolean {
    const currentUrl = this.url;
    if (currentUrl?.includes(item.route)) {
      return true;
    }
    // return item.route ? this.router.isActive(item.route, true) : false;
    return false
  }
  onItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
      
    }

    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
    //scroll
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    if (!this.expanded){
    if (window.innerWidth < 1024) {
      this.notify.emit();
    }
  }
  }
  onSubItemSelected(item: NavItem) {
    this.router.navigate([item.routeChild])
  //   if (item.routeChild) {
  //     this.router.navigate([item.routeChild]);
  //   } else {
  //     console.error('RouteChild is undefined for sub-item:', item);
  //   }
  }

}
