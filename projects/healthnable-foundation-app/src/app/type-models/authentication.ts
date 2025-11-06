export class Register {
    username!: string;
    email!: string;
    phone_number!: string;
    country_code!: string;
    password!:string;
    confirm_password!:string
}
export class Login {
    email_or_phone!: string;
    password!: string;
}
export class otpLogin{
    email_or_phone!:string;
    otp!:string
}
export class email{
    email_or_phone!:string;
}
export class resetPassword{
    confirm_password!:string;
    new_password!:string
}
export class UserData{
    role_name!: string;
    tenant_name!: number;
    tenant_id!: string;
    user_id!: number;
    access_token!: string;
}