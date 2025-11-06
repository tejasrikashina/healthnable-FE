import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {  TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthInterceptor } from './interceptor/interceptor';
import { LoaderInterceptor } from './interceptor/loader.interceptor';
import { ResponseInterceptor } from './interceptor/response.interceptor';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot() ,
        NgxSpinnerModule   ],
       providers: [
        TranslateService   ,
         provideHttpClient(
      withInterceptors([LoaderInterceptor,ResponseInterceptor,AuthInterceptor]) ,
    ), 
    MessageService  ,
    ConfirmationService,
    NgxSpinnerService  , 
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'healthnable-foundation-app' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('healthnable-foundation-app');
  });

  // it('should render title', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.nativeElement as HTMLElement;
  //   expect(compiled.querySelector('h1')?.textContent).toContain('Hello, healthnable-foundation-app');
  // });
});
