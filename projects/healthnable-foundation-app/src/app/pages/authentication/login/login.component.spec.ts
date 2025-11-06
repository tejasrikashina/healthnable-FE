import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthInterceptor } from '../../../interceptor/interceptor';
import { LoaderInterceptor } from '../../../interceptor/loader.interceptor';
import { ResponseInterceptor } from '../../../interceptor/response.interceptor';
import { MessageService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { routes } from '../../../app.routes';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export const HttpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, "./i18n/", ".json");
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [       
        TranslateModule.forRoot() ,
        NgxSpinnerModule   
      ],
      providers: [
        TranslateService   ,
         provideHttpClient(
      withInterceptors([LoaderInterceptor,ResponseInterceptor,AuthInterceptor]) ,
   
    ), 
     provideRouter(routes),
    MessageService  ,
    NgxSpinnerService  ,
      
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
