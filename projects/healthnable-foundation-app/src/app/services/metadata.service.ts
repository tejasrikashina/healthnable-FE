import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviornment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
//  private _baseUrl: string = environment.baseUrl;
//   constructor(private _httpService:HttpClient) { }
//   getCategory(): Observable<any> {
//     return this._httpService.get(`${this._baseUrl}categories`)
//   }
//  getSubcategory():Observable<any>{
//   return this._httpService.get(`${this._baseUrl}sub-categories`)
//  }
//   getcategoryList(categoryName:string): Observable<any> {
//     return this._httpService.get(`${this._baseUrl}categories?category_name=${categoryName}`);
//   }
}
