import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { delay, mergeMap, Observable, of, retryWhen, take, throwError } from 'rxjs';
import { catchError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HealthnableCoreService } from '../core-components/healthnable-core.service';

export const ResponseInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const router = inject(Router); 
  const _healtnableCoreService = inject(HealthnableCoreService); 
  return next(req).pipe(
    // retryWhen(errors =>
    //   errors.pipe(
    //     mergeMap((error, index) => {
    //       if (error.status >= 500 && error.status < 600 && index < 1) {
    //         return of(error).pipe(delay(200)); 
    //       }
    //       return throwError(() => error);
    //     }),
    //     take(1)
    //   )
    // ),
    catchError((error: any) => {
      let errorMessage = '';
      if (error.error instanceof ErrorEvent) {
        errorMessage = `${error.error.message}`;
      } 
      else {
        errorMessage = error;
        if(error.url.includes('http://202.21.38.161/python_usermanagement_api/users/verify-email?token') && (error.status)=='500'){

          _healtnableCoreService.apiError("This Email is already verified. Please login");
          router.navigate(['/login']);
          
            // setTimeout(() => {
            //   _healtnableCoreService.apiError("This Email is already verified. Please login");
            //   router.navigate(['/login']);
            // }, 5000); 
          
        }
        else{
        let errormsg = `${error.status}`;
        if (errormsg === '401') {
          sessionStorage.clear();
          _healtnableCoreService.apiError(error.error.detail);
          router.navigate(['/login']);
        }
        if (errormsg === '400'){
          if(error.url.includes('http://202.21.38.161/python_usermanagement_api/users/verify-email?token')){
            _healtnableCoreService.apiError(error.error.detail);
            router.navigate(['/login']);
          }
          else{
            _healtnableCoreService.apiError(error.error.detail);
          }
         
        }
        else if(errormsg === '422'){
          _healtnableCoreService.apiError(error.error.detail[0].msg);
        }
        else if(errormsg==='404'){
          _healtnableCoreService.apiError(error.error.detail);
        }
        else if(errormsg==='500'){
          _healtnableCoreService.apiError(error.error.detail);
        }
      }
      }
      return throwError(() => new Error(errorMessage));
    })
  );
};
