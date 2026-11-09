import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import type { EmployeeRecord } from '../../../model/employeeRecord';
import { Shared } from '../../../service/shared';
import { Focus } from '../../../core/directive/focus';
import { CommonModule } from '@angular/common';

type EmployeeCreateForm = Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'>;

@Component({
  selector: 'app-employee-create',
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SelectModule, Focus],
  templateUrl: './employee-create.html',
  styleUrl: './employee-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeCreate {
  private readonly sharedService = inject(Shared);

  readonly employeeCreated = output<void>();
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  employeeForm: EmployeeCreateForm = this.createEmptyEmployee();

  readonly genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

  readonly employmentTypeOptions = [
    { label: 'Full-Time', value: 'Full-Time' },
    { label: 'Part-Time', value: 'Part-Time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Internship', value: 'Internship' },
  ];

  readonly statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    const timestamp = new Date().toISOString();
    const employee: Omit<EmployeeRecord, 'id'> = {
      ...this.employeeForm,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.sharedService.employeeCreate(employee).subscribe({
      next: () => {
        this.isSaving.set(false);
        form.resetForm(this.createEmptyEmployee());
        this.employeeCreated.emit();
      },
      error: (error) => {
        console.error('Error creating employee:', error);
        this.errorMessage.set('Unable to add employee. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  private createEmptyEmployee(): EmployeeCreateForm {
    return {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      profileImage: '',
      isActive: true,
      email: '',
      mobileNumber: '',
      alternateMobileNumber: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pinCode: '',
      employeeCode: '',
      department: '',
      designation: '',
      employmentType: '',
      joiningDate: '',
      experience: undefined,
      reportingManager: '',
      salary: undefined,
      bankAccountNumber: '',
      bankName: '',
      ifscCode: '',
      qualification: '',
      university: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      emergencyContactRelation: '',
    };
  }
}
