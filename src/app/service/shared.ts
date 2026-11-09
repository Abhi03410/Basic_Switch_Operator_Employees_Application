import { inject, Injectable } from '@angular/core';
import { Utility } from './utility';
import { map, Observable } from 'rxjs';
import type { EmployeeRecord } from '../model/employeeRecord';
import { ENDPOINT } from '../constants/apiEndPoint';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Shared {
  private utility = inject(Utility);

  //get method:-

  getAllEmployees(filters?: any): Observable<EmployeeRecord[]> {
    console.log('service output : ', filters);
    // console.log('searchName service output : ', filters?.searchName);
    // console.log('department service output : ', filters?.department);
    // console.log('designation service output : ', filters?.designation);
    console.log('isActive service output : ', filters?.isActive);
    return this.utility.get<EmployeeRecord[]>(ENDPOINT.EMPLOYEE).pipe(
      map((response: EmployeeRecord[]) => {
        if (filters?.searchName) {
          return response.filter((employee: EmployeeRecord) =>
            employee.firstName.toLowerCase().includes(filters.searchName.toLowerCase().trim())
          );
        }

        if (filters?.department) {
          return response.filter((employee: EmployeeRecord) =>
            employee.department.toLowerCase().includes(filters.department.toLowerCase().trim())
          );
        }

        if (filters?.designation) {
          return response.filter((employee: EmployeeRecord) =>
            employee.designation.toLowerCase().includes(filters.designation.toLowerCase().trim())
          );
        }

        if (filters?.isActive !== undefined && filters?.isActive !== null) {
          return response.filter((employee: EmployeeRecord) =>
            employee.isActive === filters.isActive
          );
        }

        return response;
      })
    )
  }

  //put Method:-
  employeeUpdate(employee: EmployeeRecord): Observable<EmployeeRecord> {
    const endpoint = `${ENDPOINT.EMPLOYEE}/${encodeURIComponent(employee.id)}`;
    return this.utility.put<EmployeeRecord>(endpoint, employee);
  }

  employeeCreate(employee: Omit<EmployeeRecord, 'id'>): Observable<EmployeeRecord> {
    return this.utility.post<EmployeeRecord>(ENDPOINT.EMPLOYEE, employee);
  }

  employeeDelete(employeeId: string): Observable<void> {
    const endpoint = `${ENDPOINT.EMPLOYEE}/${encodeURIComponent(employeeId)}`;
    return this.utility.delete<void>(endpoint);
  }
}
