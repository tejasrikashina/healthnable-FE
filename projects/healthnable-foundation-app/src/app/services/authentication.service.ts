import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviornment/environment';
import { Observable } from 'rxjs';
import { coreConstants } from '../core-components/core-constants';
import { Register,Login,otpLogin, email, resetPassword } from '../type-models/authentication';
import { HttpService } from '../core-components/http.service';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _user_baseUrl: string = environment.userBaseUrl;
  constructor(private _httpService:HttpService) { }
  register(register: Register): Observable<Register> {
    return this._httpService.post(`${this._user_baseUrl}${coreConstants.Register_User}`, register);
}
getVerifyMailToken(urlToken: any) {
  return this._httpService.get(`${this._user_baseUrl}users/verify-email?token=${urlToken}`);
}
login(login: Login): Observable<Login> {
  return this._httpService.post(`${this._user_baseUrl}${coreConstants.Login_User}`, login)
}
otpVerification(otp:otpLogin):Observable<otpLogin>{
  return this._httpService.post(`${this._user_baseUrl}${coreConstants.Otp_Login}`, otp)
}
resendOtp(resendotp:email):Observable<email>{
  return this._httpService.post(`${this._user_baseUrl}${coreConstants.resend_Otp}`, resendotp)
}
forgotPassword(email:email):Observable<email>{
  return this._httpService.post(`${this._user_baseUrl}${coreConstants.forgot_Password}`, email)
}
resetPassword(email:email,reset:resetPassword):Observable<resetPassword>{
  return this._httpService.post(`${this._user_baseUrl}${coreConstants.reset_Password}/${email}`,reset)
}
// googleSignIn( idToken: string ):Observable<any>{
//   return this._httpService.post<any>(
//     `${this._user_baseUrl}${coreConstants.google_signIn}`,  { id_token: idToken })
 
// }
}
