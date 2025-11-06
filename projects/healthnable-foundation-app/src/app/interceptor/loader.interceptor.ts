// import { Injectable } from '@angular/core';
// import {
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpInterceptor,
//   HttpResponse,
//   HttpClient
// } from '@angular/common/http';
// import { Observable, tap } from 'rxjs';
// import { NgxSpinnerService } from 'ngx-spinner';

// @Injectable()
// export class LoaderInterceptor implements HttpInterceptor {

//   constructor(private spinner: NgxSpinnerService) {}

//   intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> { 
//     this.spinner.show();
//     return next.handle(request).pipe(tap(async (event: HttpEvent<any>) => {
//       if (event instanceof HttpResponse) {
//         this.spinner.hide();
//       }
//     },
//       (err: any) => {
//         this.spinner.hide();
//       }));

  
//   }
// }
import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

export const LoaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const spinner = inject(NgxSpinnerService); 

  spinner.show(); 

  return next(req).pipe(
    tap({
      next: async (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          spinner.hide(); 
        }
      },
      error: () => {
        spinner.hide(); 
      }
    })
  );
};
