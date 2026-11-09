import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Shared } from '../../../service/shared';
import { EmployeeRecord } from '../../../model/employeeRecord';

//Rxjs Operator:-

import { debounceTime, distinctUntilChanged, startWith, switchMap, } from 'rxjs';

// primeng imports

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { EmployeeDetails } from '../employee-details/employee-details';
import { EmployeeCreate } from '../employee-create/employee-create';
import { EmployeeEdit } from '../employee-edit/employee-edit';
import { Router } from '@angular/router';
import { Focus } from '../../../core/directive/focus';

type EmployeeTableField = keyof EmployeeRecord | 'employeeName';

interface EmployeeTableColumn {
  field: EmployeeTableField;
  header: string;
}

@Component({
  selector: 'app-employee-dashboard',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    SelectModule,
    FormsModule,
    RadioButtonModule,
    DialogModule,
    MultiSelectModule,
    EmployeeDetails,
    EmployeeCreate,
    EmployeeEdit,
    Focus
  ],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit {
  myEmployeeFilterForm!: FormGroup;

  private sharedService: Shared = inject(Shared);
  private formBuilder: FormBuilder = inject(FormBuilder);

  employeesDetailsLists: WritableSignal<EmployeeRecord[]> = signal<any>([]);

  employeeDepartementOptions: WritableSignal<any[]> = signal<any>([]);
  employeeDesignationOptions: WritableSignal<any[]> = signal<any>([]);
  employeeIsActive: WritableSignal<boolean | null> = signal<any>(null);

  readonly employeeTableColumns: EmployeeTableColumn[] = [
    { field: 'profileImage', header: 'Profile' },
    { field: 'employeeCode', header: 'Employee Code' },
    { field: 'employeeName', header: 'Employee Name' },
    { field: 'email', header: 'Email' },
    { field: 'mobileNumber', header: 'Mobile' },
    { field: 'department', header: 'Department' },
    { field: 'designation', header: 'Designation' },
    { field: 'isActive', header: 'Status' },
    { field: 'id', header: 'ID' },
    { field: 'dateOfBirth', header: 'Date of Birth' },
    { field: 'gender', header: 'Gender' },
    { field: 'alternateMobileNumber', header: 'Alternate Mobile' },
    { field: 'address', header: 'Address' },
    { field: 'city', header: 'City' },
    { field: 'state', header: 'State' },
    { field: 'country', header: 'Country' },
    { field: 'pinCode', header: 'PIN Code' },
    { field: 'employmentType', header: 'Employment Type' },
    { field: 'joiningDate', header: 'Joining Date' },
    { field: 'experience', header: 'Experience' },
    { field: 'reportingManager', header: 'Reporting Manager' },
    { field: 'salary', header: 'Salary' },
    { field: 'bankAccountNumber', header: 'Bank Account Number' },
    { field: 'bankName', header: 'Bank Name' },
    { field: 'ifscCode', header: 'IFSC Code' },
    { field: 'qualification', header: 'Qualification' },
    { field: 'university', header: 'University' },
    { field: 'emergencyContactName', header: 'Emergency Contact Name' },
    { field: 'emergencyContactNumber', header: 'Emergency Contact Number' },
    { field: 'emergencyContactRelation', header: 'Emergency Contact Relation' },
    { field: 'createdAt', header: 'Created At' },
    { field: 'updatedAt', header: 'Updated At' },
  ];

  readonly selectedEmployeeColumns = signal<EmployeeTableColumn[]>(
    this.employeeTableColumns.slice(0, 8)
  );
  readonly visibleEmployeeColumns = computed(() => {
    const selectedFields = new Set(
      this.selectedEmployeeColumns().map((column) => column.field)
    );
    return this.employeeTableColumns.filter((column) => selectedFields.has(column.field));
  });

  // dialog box open with employees details:-
  displayEmployeeDialog = false;
  selectedEmployee: WritableSignal<any> = signal<any>(null);

  //dialog box open with employees creating:-
  displayCreateEmployeeDialog = false;
  selectEmployeeCreated: WritableSignal<any> = signal<any>(null);

  //dialog box open with employees editing:-
  diplayEditEmployeeDialog = false;
  selectEmployeeEdited: WritableSignal<any> = signal<any>(null);

  // dialog box open with employee deletion confirmation:-
  displayDeleteEmployeeDialog = false;
  employeePendingDeletion: WritableSignal<EmployeeRecord | null> = signal(null);
  isDeletingEmployee = signal(false);
  deleteEmployeeError = signal<string | null>(null);

  //chats showing open with component:-
  private router: Router = inject(Router);

  // counting
  // Total Employees
  totalEmployeeCount = computed(() =>
    this.employeesDetailsLists().length
  );

  // Active Employees
  activeEmployeeCount = computed(() =>
    this.employeesDetailsLists().filter(
      emp => emp.isActive === true
    ).length
  );

  // Inactive Employees
  inactiveEmployeeCount = computed(() =>
    this.employeesDetailsLists().filter(
      emp => emp.isActive === false
    ).length
  );

  // Department Wise Count
  departmentCounts = computed(() => {

    const employees = this.employeesDetailsLists();

    const counts: Record<string, number> = {};

    employees.forEach(emp => {

      const department = emp.department || 'Unknown';

      counts[department] = (counts[department] || 0) + 1;

    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    }));

  });

  // Designation Wise Count
  designationCounts = computed(() => {

    const employees = this.employeesDetailsLists();

    const counts: Record<string, number> = {};

    employees.forEach(emp => {

      const designation = emp.designation || 'Unknown';

      counts[designation] = (counts[designation] || 0) + 1;

    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    }));

  });


  ngOnInit(): void {
    this.intialEmployeesForm();

    this.getAllEmployeesDetails();

    this.myEmployeeFilterForm.valueChanges.pipe(
      startWith(this.myEmployeeFilterForm.value),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchName: any) => this.sharedService.getAllEmployees(searchName))
    ).subscribe({
      next: (response) => {
        console.log('employee dashboard component output : ', response);
        this.employeesDetailsLists.set(response);
      }
    });
  }

  // Store original employee records
  allEmployees: EmployeeRecord[] = [];

  getAllEmployeesDetails() {
    this.sharedService.getAllEmployees().subscribe({
      next: (response) => {

        // Update employeesDetailsLists with the fetched data

        this.employeesDetailsLists.set(response);

        // Update employeeDepartementOptions based on the fetched employees details

        this.employeesDetailsLists().forEach((emp) => {
          const department = emp.department;
          const designation = emp.designation;
          const isActive = emp.isActive;
          if (department && !this.employeeDepartementOptions().some((option) => option.label === department)) {
            this.employeeDepartementOptions.update((options) => [...options, { label: department, value: department }]);
          }

          if (designation && !this.employeeDesignationOptions().some((option) => option.label === designation)) {
            this.employeeDesignationOptions.update((options) => [...options, { label: designation, value: designation }]);
          }

          if (isActive !== null && !this.employeeIsActive()) {
            this.employeeIsActive.set(isActive);
          }

        });
        console.log('All Employees Details:', response);
      },
      error: (error) => {
        console.error('Error fetching employees details:', error);
      }
    });
  }

  intialEmployeesForm() {
    this.myEmployeeFilterForm = this.formBuilder.group({
      searchName: this.formBuilder.control(''),
      department: this.formBuilder.control(''),
      designation: this.formBuilder.control(''),
      isActive: this.formBuilder.control(null),
    });
  }

  formatEmployeeValue(employee: EmployeeRecord, field: EmployeeTableField): string {
    if (field === 'employeeName') {
      return `${employee.firstName} ${employee.lastName}`;
    }

    const value = employee[field];
    return value === undefined || value === null || value === '' ? '—' : String(value);
  }

  // refresh :-
  refreshEmployees(): void {
    this.getAllEmployeesDetails();
  }

  // Employees details:-

  onEmployeeDetails(employeeIdCode: string) {
    console.log('employee id code : ', employeeIdCode);

    const mySpecificEmployeeData = this.employeesDetailsLists().find(emp => emp.employeeCode === employeeIdCode);

    if (mySpecificEmployeeData) {
      console.log('my specific employee data : ', mySpecificEmployeeData);

      this.selectedEmployee.set(mySpecificEmployeeData);
      this.displayEmployeeDialog = true;

    } else {
      console.log('No employee found with the given ID code.');
    }
  }

  // Employees Created:-

  onEmployeeCreatingForms() {
    console.log('create employee button is working perfectly...')
    this.displayCreateEmployeeDialog = true;
    this.selectEmployeeCreated.set(null);
  }

  //Employees Edited:-
  onSpecificEmpEdited(employeeCode: string) {
    const editEmployeeData = this.employeesDetailsLists().find(emp => emp.employeeCode === employeeCode);
    if (editEmployeeData) {
      console.log('edit employee data : ', editEmployeeData);
      this.diplayEditEmployeeDialog = true;
      this.selectEmployeeEdited.set(editEmployeeData);
    }
  }

  onEmployeeEditSaved(): void {
    this.diplayEditEmployeeDialog = false;
    this.refreshEmployees();
  }

  onEmployeeCreated(): void {
    this.displayCreateEmployeeDialog = false;
    this.refreshEmployees();
  }

  onEmployeeDeleteRequested(employee: EmployeeRecord): void {
    this.employeePendingDeletion.set(employee);
    this.deleteEmployeeError.set(null);
    this.displayDeleteEmployeeDialog = true;
  }

  onEmployeeDeleteConfirmed(): void {
    const employee = this.employeePendingDeletion();
    if (!employee || this.isDeletingEmployee()) {
      return;
    }

    this.isDeletingEmployee.set(true);
    this.deleteEmployeeError.set(null);
    this.sharedService.employeeDelete(employee.id).subscribe({
      next: () => {
        this.isDeletingEmployee.set(false);
        this.displayDeleteEmployeeDialog = false;
        this.employeePendingDeletion.set(null);
        this.refreshEmployees();
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
        this.deleteEmployeeError.set('Unable to delete employee. Please try again.');
        this.isDeletingEmployee.set(false);
      }
    });
  }

  onDeleteEmployeeDialogClosed(): void {
    if (!this.isDeletingEmployee()) {
      this.employeePendingDeletion.set(null);
      this.deleteEmployeeError.set(null);
    }
  }

  // charts showing :-
  onNavigateEmpListPage() {
    this.router.navigate(['/employees-list']);
  }

}
