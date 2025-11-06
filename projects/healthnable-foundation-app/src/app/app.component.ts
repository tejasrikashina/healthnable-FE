import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// perfect scrollbar
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { PrimeNGModule } from './material/primeng.module';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet,CommonModule, NgScrollbarModule, TranslateModule,PrimeNGModule,NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'healthnable-foundation-app';
  constructor(private translate: TranslateService,private spinner: NgxSpinnerService) {
    this.translate.addLangs(['ar','de', 'en']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
}

}
