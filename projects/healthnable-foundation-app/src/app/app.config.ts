import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoaderInterceptor } from './interceptor/loader.interceptor';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { AuthInterceptor } from './interceptor/interceptor';
const HttpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, "./i18n/", ".json");
export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(NgxSpinnerModule), 
    provideAnimations(),
    provideHttpClient(
      withInterceptors([LoaderInterceptor,ResponseInterceptor,AuthInterceptor]) 
    ),
    NgxSpinnerService,
    provideTranslateService({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    MessageService ,
    ConfirmationService
   
  ],
};
