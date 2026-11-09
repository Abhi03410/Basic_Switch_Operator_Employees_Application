import { ChangeDetectionStrategy, Component, inject, input, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import type { EmployeeRecord } from '../../../model/employeeRecord';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Shared } from '../../../service/shared';
import { Focus } from '../../../core/directive/focus';

@Component({
  selector: 'app-employee-edit',
  imports: [CommonModule, ButtonModule, CardModule, InputTextModule, TabsModule, CommonModule, ReactiveFormsModule, Focus],
  templateUrl: './employee-edit.html',
  styleUrl: './employee-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeEdit implements OnChanges, OnInit {
  readonly employeesData = input<EmployeeRecord | null>(null);

  private fb: FormBuilder = inject(FormBuilder);

  myEmployeeEditingForm!: FormGroup;

  readonly closeCard = output<void>();

  private sharedService: Shared = inject(Shared);

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['employeesData'] || !this.myEmployeeEditingForm) {
      return;
    }

    const employee = this.employeesData();
    if (employee) {
      this.myEmployeeEditingForm.patchValue(employee);
    } else {
      this.myEmployeeEditingForm.reset();
    }
  }

  ngOnInit(): void {
    this.employeeEditiedInitialForm();
    const employee = this.employeesData();
    if (employee) {
      this.myEmployeeEditingForm.patchValue(employee);
    }
  }

  employeeEditiedInitialForm() {
    this.myEmployeeEditingForm = this.fb.group({

      // Personal Information
      firstName: this.fb.control('', Validators.required),
      lastName: this.fb.control('', Validators.required),
      dateOfBirth: this.fb.control('',),
      gender: this.fb.control(''),
      profileImage: this.fb.control(''),
      isActive: this.fb.control<boolean | null>(null),

      // Contact Information
      email: this.fb.control('', [Validators.required, Validators.email]),
      mobileNumber: this.fb.control(''),
      alternateMobileNumber: this.fb.control(''),
      address: this.fb.control(''),
      city: this.fb.control(''),
      state: this.fb.control(''),
      country: this.fb.control(''),
      pinCode: this.fb.control(''),

      // Employment Information
      employeeCode: this.fb.control(''),
      department: this.fb.control(''),
      designation: this.fb.control(''),
      employmentType: this.fb.control(''),
      joiningDate: this.fb.control(''),
      experience: this.fb.control<number | null>(null),
      reportingManager: this.fb.control(''),

      // Compensation and Banking
      salary: this.fb.control<number | null>(null),
      bankAccountNumber: this.fb.control(''),
      bankName: this.fb.control(''),
      ifscCode: this.fb.control(''),

      // Education
      qualification: this.fb.control(''),
      university: this.fb.control(''),

      // Emergency Contact
      emergencyContactName: this.fb.control(''),
      emergencyContactNumber: this.fb.control(''),
      emergencyContactRelation: this.fb.control(''),

      // Record Information
      id: this.fb.control<string | number | null>(null),
      createdAt: this.fb.control(''),
      updatedAt: this.fb.control('')
    });
  }

  onSaveEmployeeForm() {
    console.log('Form Data:', this.myEmployeeEditingForm.getRawValue());
    this.sharedService.employeeUpdate(this.myEmployeeEditingForm.getRawValue()).subscribe({
      next: (response) => {
        console.log('Employee updated successfully', response);
        this.closeCard.emit();
      },
      error: (error) => {
        console.error('Error updating employee:', error);
      }
    });
  }

}
