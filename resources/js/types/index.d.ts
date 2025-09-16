import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
    onClick?: () => void;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

// export interface User {
//     id: number;
//     name: string;
//     email: string;
//     avatar?: string;
//     email_verified_at: string | null;
//     created_at: string;
//     updated_at: string;
//     [key: string]: unknown; // This allows for additional properties...
// }

export interface EmployeeBasicInfo {
    id: number;
    name: string;
    email?: string | null;
}

export interface User {
    Employee_ID: number;
    EmployeeNo: string;
    FirstName: string;
    LastName: string;
    FullName: string;
    MiddleName: string;
    PositionLevel_ID: number;
    Position: string;
    PositionCode: string;
    Department_ID: number;
    Department: string;
    PositionLevelCode: string;
    Email: string;
    SuperiorEmp_ID: number;
    SuperiorFullName: string;
    SuperiorEmail: string;
    info?: EmployeeInfo;
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
export interface Location {
    Employee_ID: number;
    Location_ID: number;
    LocationCode: string;
    Location: string;
    location?: Location;
}
