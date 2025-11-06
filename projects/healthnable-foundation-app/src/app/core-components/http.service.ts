import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private _httpClient: HttpClient) { }

  /** 
  @param url -This is a get method where url will the api url
  @returns the file in binary data.
  */ 

  get(url: string, options?: { responseType: "blob"; }): Observable<any> {
    return this._httpClient.get(url);
  }
  
  getDoc<T>(url: string, asBlob: boolean = false): Observable<T> {
    const options = asBlob ? { responseType: 'blob' as 'json' } : {};
    return this._httpClient.get<T>(url, options);
  }
    getBlob(url: string): Observable<Blob> {
    return this._httpClient.get(url,{ responseType: 'blob' });
  }
  getByParams(url: string, body: any): Observable<any> {
    return this._httpClient.get(url, body);
  }

   /** 
  @param url -This is a post method where url will the api url, model will have the data which to create
  @returns the file in binary data.
  */ 

  // post(url: string, model: any): Observable<any> {
  //   const body = model? JSON.stringify(model) : null;

  //   let httpHeaders = new HttpHeaders()
  //     .set('Content-Type', 'application/json');

  //   return this._httpClient.post(url, body, {
  //     headers: httpHeaders
  //   });
  // }
  post(url: string, model: any): Observable<any> {
  let headers = new HttpHeaders();

  // Only set content type if NOT sending FormData
  if (!(model instanceof FormData)) {
    headers = headers.set('Content-Type', 'application/json');
    model = JSON.stringify(model);
  }

  return this._httpClient.post(url, model, { headers });
}
  postImageNew(url: string, formData: FormData): Observable<any> {
    return this._httpClient.post(url, formData);
  }
  
  /** 
  @param url - url will the api url
  @param model -model will have the image information
  @returns the file in binary data.
  */ 

  postImage(url: string, model: any): Observable<any> {
    return this._httpClient.post(url, model);
  }

  /** 
  @param url - url will the api url
  @param model - model will have the information to update
  @param id - for which we will update the info
  @returns the file in binary data.
  */ 

  // put(url: string, model: any): Observable<any> {
  //   const body = JSON.stringify(model);

  //   let httpHeaders = new HttpHeaders()
  //     .set('Content-Type', 'application/json');

  //   return this._httpClient.put(url, body, {
  //     headers: httpHeaders
  //   });
  // }
    put(url: string, model: any): Observable<any> {
    let headers = new HttpHeaders();

  // Only set content type if NOT sending FormData
  if (!(model instanceof FormData)) {
    headers = headers.set('Content-Type', 'application/json');
    model = JSON.stringify(model);
  }
     return this._httpClient.put(url, model, { headers });
  }

  /** 
  @param url - url will the api url
  @returns the file in binary data.
  */ 

  delete(url: string): Observable<any> {
    return this._httpClient.delete(url);
  }

  /** 
  @param url - url will the api url
  @param id - id to delete the data
  @returns the file in binary data.
  */ 
  deleteItem(url: string, id: number): Observable<any> {
    return this._httpClient.delete(url + id);
  }
}
