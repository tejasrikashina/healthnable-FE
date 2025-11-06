export interface metricData {
  kpiCode: string;
  kpiName: string;
  unit: string;
  frequency: string;
  source: string;
  applicableDash: string;
  description: string;
  status: boolean;
}
export interface widgetData {
  dashboard: string;
  kpi: string;
  displayName: string;
  visualizationType: string;
  threshold: string;
  patients: string;
  alertColor: string;
  drilldown: string;
  mapping: string;
  refresh: string;
  show: boolean;
}
export interface drilldownData {
  screenName: string;
  screenId: string;
  objType: string;
  screenType: string;
  source:string,
  status: string;
}
export interface metriclevelData {
  dashboardName: string;
  accesibleMetrics: string;
  department: string;
  facility: string;
}
export interface dashboardData {
  dashboard_name: string;
  dashboard_type: string;
  description: string;
  theme: string;
  status: string;
}
export interface rolBasedData {
  role_name: string;
  department_names: string;
  facility_names: string;
  dashboard_names: string;
}
export interface  DropdownOption {
  label: string;
  value: string | number;
}
export interface orgData {
  organization_name: string;
  email: string;
  phone: string;
  tax_id: string;
  npi: string;
  zipcode: string;
  country: string;
  state: string;
  country_code: string;
  city: string;
  address_line1: string;
  address_line2: string;
  timezone: string;
  default_language: string;
  primary_contact: string;
  website: string;
  organization_type: string;
  description: string;
  status: string;
  logo: string;
  favicon: string;
}
export interface metricDrilldownData {
  metricName: string;
  mappedScreen: string;
  objType: string;
  navigation: string;
}
export interface trackerData{
  kpiName:string;
  lastSync:string;
          expectedInt: string;
        selectedAlert:string,


  
}
