import { Component, Input, OnInit } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { MaterialModule } from '../../../../material/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { PrimeNGModule } from '../../../../material/primeng.module';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'healthnable-header',
  standalone: true,
  imports: [FeatherModule,MaterialModule, NgScrollbarModule,PrimeNGModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  items: MenuItem[] | undefined;
  constructor(private router:Router){}
  @Input() showToggle = true;
  ngOnInit() {
    this.items = [
        
     
        {
            label: 'Profile',
        },
        {
            separator: true
        }
    ];
}
logout(){
  this.router.navigate(['/login'])
}
}
