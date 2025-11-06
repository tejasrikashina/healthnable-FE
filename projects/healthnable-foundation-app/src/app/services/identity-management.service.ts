import { Injectable } from '@angular/core';
import { environment } from '../../enviornment/environment';
import { Observable } from 'rxjs';
import { roleData, userData } from '../type-models/identityManagement';
import { HttpService } from '../core-components/http.service';

@Injectable({
  providedIn: 'root',
})
export class IdentityManagementService {
  private _user_baseUrl: string = environment.userBaseUrl;
  constructor(private _httpService: HttpService) {}
  getAllUsers(pageIndex: number, pageSize: number): Observable<any> {
    return this._httpService.get(
      `${this._user_baseUrl}endusers/users?page=${pageIndex}&limit=${pageSize}`
    );
  }
  getUserById(userId: any) {
    return this._httpService.get(
      `${this._user_baseUrl}endusers/users/${userId}`
    );
  }
  getPermissionDropDown(): Observable<[]> {
    return this._httpService.get(`${this._user_baseUrl}permissions/ `);
  }
  addUser(userData: userData) {
    return this._httpService.post(
      `${this._user_baseUrl}endusers/users`,
      userData
    );
  }

  getAllRoles(pageIndex: number, pageSize: number): Observable<any> {
    return this._httpService.get(
      `${this._user_baseUrl}roles/?page=${pageIndex}&limit=${pageSize}`
    );
  }
  searchByRoleName(roleName: string, pageIndex: number, pageSize: number) {
    return this._httpService.get(
      `${this._user_baseUrl}search?query=${roleName}&page=${pageIndex}&limit=${pageSize}`
    );
  }
  getRoleDropdown() {
    return this._httpService.get(`${this._user_baseUrl}roles/names`);
  }
  deleteUser(userId: any) {
    return this._httpService.delete(
      `${this._user_baseUrl}/endusers/users/${userId}`
    );
  }
  updateUser(userId: any, user: userData): Observable<userData> {
    return this._httpService.put(
      `${this._user_baseUrl}endusers/users/${userId}`,
      user
    );
  }
  deleteRole(roleId: any) {
    return this._httpService.delete(`${this._user_baseUrl}/roles/${roleId}`);
  }
  searchByName(searchName: string) {
    return this._httpService.get(
      `${this._user_baseUrl}roles/search?query=${searchName}`
    );
  }
  getRole() {
    return this._httpService.get(`${this._user_baseUrl}roles/names`);
  }
  addRole(roleData: roleData) {
    return this._httpService.post(`${this._user_baseUrl}roles`, roleData);
  }
  searchByRoleStatus(status: string, pageIndex: number, pageSize: number) {
    return this._httpService.get(
      `${this._user_baseUrl}roles/roles/filter?status=${status}&page=${pageIndex}&limit=${pageSize}`
    );
  }
}
