export interface NavItem {
    displayName?: string;
    navCap?: string;
    chipClass?: string;
    subtext?: string;
    route?: any;
    routeChild?:string;
    children?: NavItem[];
}