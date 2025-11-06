export class Permission {
    name!: string;
    checked: any;
    length!:number
  }
  
  export interface userData{
     first_name: string,
  last_name: string
  email:string,
  temporary_password: string,
  roles:[]
  department:string,
  status: string
  password:string
  }
    export interface roleData{
     role_name: string,
  description: string
  report_to:string,
  permissions: {},
  status: string
  }