import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppSettings, defaults } from '../services/core';
@Injectable({
  providedIn: 'root'
})
export class CoreService {
  get notify(): Observable<Record<string, any>> {
    return this.notify$.asObservable();
  }
  constructor() { }
  private notify$ = new BehaviorSubject<Record<string, any>>({});

  getOptions() {
    return this.options;
  }

  setOptions(options: AppSettings) {
    this.options = Object.assign(defaults, options);
    this.notify$.next(this.options);
  }

  private options = defaults;

  getLanguage() {
    return this.options.language;
  }

  setLanguage(lang: string) {
    this.options.language = lang;
    this.notify$.next({ lang });
  }

  private subject = new Subject<any>();
  
  sendLanguageChangeEvent() {
    this.subject.next('');
  }
  
  getLanguageChangeEvent(): Observable<any> {
      return this.subject.asObservable();
  }

  sendUserUpdateChangeEvent() {
    this.subject.next('');
  }
  
  getUserUpdateChangeEvent(): Observable<any> {
      return this.subject.asObservable();
  }

  sendDashboardUpdateChangeEvent() {
    this.subject.next('');
  }
  
  getDashboardUpdateChangeEvent(): Observable<any> {
      return this.subject.asObservable();
  }
}
