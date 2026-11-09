import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/model/enums/user-role';

export const routes: Routes = [
    { path: '', redirectTo: 'register', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./core/component/login-page/login-page').then(m => m.LoginPage) },
    { path: 'register', loadComponent: () => import('./core/component/register-page/register-page').then(m => m.RegisterPage) },
    { path: 'employees-dashboard', canActivate: [authGuard, roleGuard(UserRole.EMPLOYEE)], loadComponent: () => import('./component/employee/employee-dashboard/employee-dashboard').then(m => m.EmployeeDashboard) },
    { path: 'employees-details', canActivate: [authGuard, roleGuard(UserRole.EMPLOYEE)], loadComponent: () => import('./component/employee/employee-details/employee-details').then(m => m.EmployeeDetails) },
    { path: 'employees-list', canActivate: [authGuard, roleGuard(UserRole.EMPLOYEE)], loadComponent: () => import('./component/employee/employee-list/employee-list').then(m => m.EmployeeList) },
    { path: 'employees-create', canActivate: [authGuard, roleGuard(UserRole.EMPLOYEE)], loadComponent: () => import('./component/employee/employee-create/employee-create').then(m => m.EmployeeCreate) },
    { path: 'employees-edit', canActivate: [authGuard, roleGuard(UserRole.EMPLOYEE)], loadComponent: () => import('./component/employee/employee-edit/employee-edit').then(m => m.EmployeeEdit) },

    // Admin dashboard
    { path: 'admin-dashboard', canActivate: [authGuard, roleGuard(UserRole.ADMIN)], loadComponent: () => import('./component/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
];
