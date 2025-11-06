import { CanActivateFn } from '@angular/router';


export const authGuard: CanActivateFn = (route, state) => {
  const currentUser = sessionStorage.getItem('currentUser');
  const token: string | null = currentUser ? JSON.parse(currentUser)?.access_token : null; 
  if (!token) {
    window.location.href = 'http://202.21.38.161/foundation_suite_new/login';
    return false;
  } else {    
    return true;
  }
};