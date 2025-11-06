// import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { Injectable } from '@angular/core';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//     intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
       
//         const currentUser = sessionStorage.getItem('currentUser');
//         const token: string | null = currentUser ? JSON.parse(currentUser)?.token : null;   
//         request = request.clone({
//             setHeaders: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return next.handle(request);
//     }
// }


import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';


export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const currentUser = sessionStorage.getItem('currentUser');
  const token: string | null = currentUser ? JSON.parse(currentUser)?.access_token : null;

  
  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(req);

};


