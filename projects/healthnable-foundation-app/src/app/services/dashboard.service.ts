import { Injectable } from '@angular/core';
import { environment } from '../../enviornment/environment';
import { HttpService } from '../core-components/http.service';
import { Observable } from 'rxjs';
import { dashboardData, rolBasedData } from '../type-models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private _dashboard_baseUrl: string = environment._baseUrl;
 constructor(private _httpService:HttpService){}
 getDashboard(pageIndex: number, pageSize: number):Observable<any>{
  return this._httpService.get(`${this._dashboard_baseUrl}dashboard/getall-dashboards?page=${pageIndex}&limit=${pageSize}`);
}
  addDashboard(dashboard: dashboardData): Observable<dashboardData> {
    return this._httpService.post(`${this._dashboard_baseUrl}dashboard/create-dashboards`, dashboard);
}
getDashboardByCode(dashboardCode:any): Observable<any> {
    return this._httpService.get(`${this._dashboard_baseUrl}dashboard/dashboards/${dashboardCode}`)
  }
  getThemes(){
    return this._httpService.get(`${this._dashboard_baseUrl}dashboard/themes`)
  }
  getDashboardType(){
    return this._httpService.get(`${this._dashboard_baseUrl}dashboard/dashboards/dashboard-types`)
  }
  updateDashboard(dashboardCode:any,dashboard:dashboardData): Observable<dashboardData> {
     return this._httpService.put(`${this._dashboard_baseUrl}dashboard/dashboards/${dashboardCode}`,dashboard);
  }
  deleteDashboard(dashboardCode:any){
 return this._httpService.delete(`${this._dashboard_baseUrl}dashboard/dashboards/${dashboardCode}`)
  }
  searchItem(searchTerm:string,pageIndex: number, pageSize: number ){
    return this._httpService.get(`${this._dashboard_baseUrl}dashboard/search-dashboards?search_term=${searchTerm}&page=${pageIndex}&limit=${pageSize}`)
  }
  getRoleDashboard(){
    return this._httpService.get(`${this._dashboard_baseUrl}role-dashboard-access/`)
  }
  getAllRoles(){
    return this._httpService.get(`${this._dashboard_baseUrl}role-dashboard-access/roles`)
  }
  getAllDepartments(){
     return this._httpService.get(`${this._dashboard_baseUrl}role-dashboard-access/departments`)
  }
  getAllFacilities(){
     return this._httpService.get(`${this._dashboard_baseUrl}role-dashboard-access/facilities`)
  }
  getAllDashboards(){
      return this._httpService.get(`${this._dashboard_baseUrl}role-dashboard-access/dashboards`)
  }
  getroleEntries(pageIndex: number, pageSize: number):Observable<any>{
     return this._httpService.get(`${this._dashboard_baseUrl}role-dashboard-access/?page=${pageIndex}&limit=${pageSize}`)
  }
  addRoleBased(roleDashboardData: rolBasedData): Observable<rolBasedData> {
    return this._httpService.post(`${this._dashboard_baseUrl}role-dashboard-access/`, roleDashboardData);

  }
  getUnits(){
    return this._httpService.get(`${this._dashboard_baseUrl}kpi/units`)
  }
    getFreq(){
    return this._httpService.get(`${this._dashboard_baseUrl}kpi/frequencies`)
  }
  getSourceDataset(){
    return this._httpService.get(`${this._dashboard_baseUrl}kpi/datasets`)

  }
   getKPIs(pageIndex: number, pageSize: number):Observable<any>{
  return this._httpService.get(`${this._dashboard_baseUrl}kpi/kpis?page=${pageIndex}&limit=${pageSize}`);
}
  deleteKPI(kpiCode:any){
 return this._httpService.delete(`${this._dashboard_baseUrl}kpi/kpis/${kpiCode}`)
  }
  getAllOperator(){
      return this._httpService.get(`${this._dashboard_baseUrl}operators/operators`)
  }
  getAllFields(){
    return this._httpService.get(`${this._dashboard_baseUrl}api/filters/fields`)
  }
  getdatasetNames(){
    return this._httpService.get(`${this._dashboard_baseUrl}datasets/datasets/names`)
  }
  getfilterOperators(){
     return this._httpService.get(`${this._dashboard_baseUrl}api/filters/operators`)
  }
  getAllDatasets(){
    return this._httpService.get(`${this._dashboard_baseUrl}datasets/datasets/all`)
  }
    deleteRoleBased(roleBasedId:any){
 return this._httpService.delete(`${this._dashboard_baseUrl}role-dashboard-access/${roleBasedId}`)
  }
}
