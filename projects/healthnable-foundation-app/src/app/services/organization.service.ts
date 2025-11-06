import { Injectable } from '@angular/core';
import { environment } from '../../enviornment/environment';
import { Observable } from 'rxjs';
import { HttpService } from '../core-components/http.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  private _orgUrl: string = environment._baseUrl;
 constructor(private _httpService:HttpService){}
   getAllOrganizations(pageIndex: number, pageSize: number):Observable<any>{
    return this._httpService.get(`${this._orgUrl}organization/organization/all?page=${pageIndex}&limit=${pageSize}`);
  }
    addOrg(organization: FormData): Observable<any> {
      return this._httpService.post(`${this._orgUrl}organization/organization`, organization);
  }
  getLanguages(){
      return this._httpService.get(`${this._orgUrl}location/languages`)
  }
  getCountries(){
     return this._httpService.get(`${this._orgUrl}location/countries`)
  }
  getOrgType(){
    return this._httpService.get(`${this._orgUrl}organization/organization-type/all`)
  }
  getStates(countryCode:any){
     return this._httpService.get(`${this._orgUrl}location/states/${countryCode}`)
  }
  getCities(countryCode:any, stateCode:any){
 return this._httpService.get(`${this._orgUrl}location/cities/${countryCode}/${stateCode}`)
  }
  getTimeZone(countryCode:any){
return this._httpService.get(`${this._orgUrl}location/timezones/${countryCode}`)
  }
  getOrgByCode(orgCode:any): Observable<any> {
    return this._httpService.get(`${this._orgUrl}organization/organization/by-code/${orgCode}`)
  }
    updateOrg(orgCode:any,organization:FormData): Observable<any> {
       return this._httpService.put(`${this._orgUrl}organization/organization/${orgCode}`,organization);
    }
    getOrgFilterCountries(){
     return this._httpService.get(`${this._orgUrl}organization/organization/get-countries`)
    }
    getOrgFilterStates(){
     return this._httpService.get(`${this._orgUrl}organization/organization/get-states`)

    }
    getOrgFilterCities(){
      return this._httpService.get(`${this._orgUrl}organization/organization/get-cities`)
    }
    searchByCode(orgCode:any,pageIndex: number, pageSize: number){
      return this._httpService.get(`${this._orgUrl}organization/organizations/by-code?organization_code=${orgCode}&page=${pageIndex}&limit=${pageSize}`)
    }
  deleteOrg(orgCode:any){
 return this._httpService.delete(`${this._orgUrl}organization/organization/${orgCode}`)
  }
  searchByCountry(searchCountry:string,pageIndex: number, pageSize: number){
    return this._httpService.get(`${this._orgUrl}organization/organization/filter-by-country?country=${searchCountry}&page=${pageIndex}&limit=${pageSize}`)
  }
searchByState(searchState:string,pageIndex:number,pageSize:number){
  return this._httpService.get(`${this._orgUrl}organization/organization/filter-by-state?state=${searchState}&page=${pageIndex}&limit=${pageSize}`)
}
searchByOrgStatus(searchStatus:string,pageIndex:number,pageSize:number){
  return this._httpService.get(`${this._orgUrl}organization/organization/filter-by-status?status=${searchStatus}&page=${pageIndex}&limit=${pageSize}`)

}
searchByOrgName(searchName:string,pageIndex:number,pageSize:number){
  return this._httpService.get(`${this._orgUrl}organization/organization/get-by-name?name=${searchName}&page=${pageIndex}&limit=${pageSize}`)
}
filterByAll(orgName:string,country:string,state:string,city:string,status:string,pageIndex:number,pageSize:number){
  return this._httpService.get(`${this._orgUrl}organization/organizations/filter?organization_name=${orgName}&country=${country}&state=${state}&city=${city}&status=${status}&page=${pageIndex}&limit=${pageSize}`)
}
//Facility
 getAllFacilities(pageIndex: number, pageSize: number):Observable<any>{
    return this._httpService.get(`${this._orgUrl}facility/getall-facilities?page=${pageIndex}&limit=${pageSize}`);
  }
  getOrgNames(){
         return this._httpService.get(`${this._orgUrl}organization/organization/names'`)
  }
  getFacByCode(facCode:any): Observable<any>{
 return this._httpService.get(`${this._orgUrl}facility/facility/${facCode}`)
  }
  deleteFacility(facCode:any){
 return this._httpService.delete(`${this._orgUrl}facility/facility/${facCode}`)
  }
  searchByFacName(searchName:string,pageIndex:number,pageSize:number){
  return this._httpService.get(`${this._orgUrl}facility/facilities/search?name=${searchName}&page=${pageIndex}&limit=${pageSize}`)
}
  searchByFacCountry(searchCountry:string,pageIndex: number, pageSize: number){
    return this._httpService.get(`${this._orgUrl}facility/facilities/by-country?country=${searchCountry}&page=${pageIndex}&limit=${pageSize}`)
  }
searchByFacState(searchState:string,pageIndex:number,pageSize:number){
  return this._httpService.get(`${this._orgUrl}facility/facilities/by-state?state=${searchState}&page=${pageIndex}&limit=${pageSize}`)
}
searchByFacStatus(searchStatus:string,pageIndex:number,pageSize:number){
  return this._httpService.get(`${this._orgUrl}facility/filter-facilities-by-status?status=${searchStatus}&page=${pageIndex}&limit=${pageSize}`)

}
getFacilityType(){
    return this._httpService.get(`${this._orgUrl}facility/facility-types`)

}
getAssOrg(){
    return this._httpService.get(`${this._orgUrl}facility/associated-organizations`)

}
addFacility(facility:FormData){
 return this._httpService.post(`${this._orgUrl}facility/facility`, facility);
}
 updateFacility(facCode:any,facility:FormData): Observable<any> {
       return this._httpService.put(`${this._orgUrl}facility/facility/${facCode}`,facility);
    }

  //Department
   getDepartment(pageIndex: number, pageSize: number):Observable<any>{
    return this._httpService.get(`${this._orgUrl}department/department?page=${pageIndex}&limit=${pageSize}`);
  }
    deleteDepartment(depCode:any){
 return this._httpService.delete(`${this._orgUrl}department/department/${depCode}`)

  }
  getDepNames(){
     return this._httpService.get(`${this._orgUrl}department/department/names`)
  }
  searchByDepStatus(status:string,pageIndex: number, pageSize: number){
    return this._httpService.get(`${this._orgUrl}department/department/filter?status=${status}&page=${pageIndex}&limit=${pageSize}`)
  }
  getDepHods(){
    return this._httpService.get(`${this._orgUrl}department/department/hods`)
  }
  getParentDepartment(){
    return this._httpService.get(`${this._orgUrl}department/department/parents`)

  }
  getAssociatedLoc(){
    return this._httpService.get(`${this._orgUrl}department/department/associated-locations`)
  }
  getDepType(){
    return this._httpService.get(`${this._orgUrl}department/department/types`)
  }
  getAssociatedOrg(){
     return this._httpService.get(`${this._orgUrl}department/department/associated-organizations`)
  }
  addDepartment(department:FormData){
 return this._httpService.post(`${this._orgUrl}department/department`, department);
}
}
