import { Injectable } from '@angular/core';
import { environment } from '../../enviornment/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CommonUsedService {
  // private _baseUrl: string = environment.baseUrl;
  constructor(private _httpService:HttpClient) { }

}
