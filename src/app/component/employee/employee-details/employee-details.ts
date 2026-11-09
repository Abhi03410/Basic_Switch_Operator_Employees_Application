import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EmployeeRecord } from '../../../model/employeeRecord';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';

interface EmployeeDetailField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-employee-details',
  imports: [CardModule, InputTextModule, TabsModule, TagModule],
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDetails {
  readonly employee = input<EmployeeRecord | null>(null);

  readonly employeeName = computed(() => {
    const employee = this.employee();
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employee details';
  });

  readonly personalFields = computed(() => {
    const employee = this.employee();
    return employee
      ? this.createFields([
        ['First name', employee.firstName],
        ['Last name', employee.lastName],
        ['Date of birth', employee.dateOfBirth],
        ['Gender', employee.gender],
        ['Status', employee.isActive ? 'Active' : 'Inactive'],
      ])
      : [];
  });

  readonly contactFields = computed(() => {
    const employee = this.employee();
    return employee
      ? this.createFields([
        ['Email', employee.email],
        ['Mobile number', employee.mobileNumber],
        ['Alternate mobile number', employee.alternateMobileNumber],
        ['Address', employee.address],
        ['City', employee.city],
        ['State', employee.state],
        ['Country', employee.country],
        ['PIN code', employee.pinCode],
      ])
      : [];
  });

  readonly employmentFields = computed(() => {
    const employee = this.employee();
    return employee
      ? this.createFields([
        ['Employee code', employee.employeeCode],
        ['Department', employee.department],
        ['Designation', employee.designation],
        ['Employment type', employee.employmentType],
        ['Joining date', employee.joiningDate],
        ['Experience (years)', employee.experience],
        ['Reporting manager', employee.reportingManager],
      ])
      : [];
  });

  readonly compensationFields = computed(() => {
    const employee = this.employee();
    return employee
      ? this.createFields([
        ['Salary', employee.salary],
        ['Bank account number', employee.bankAccountNumber],
        ['Bank name', employee.bankName],
        ['IFSC code', employee.ifscCode],
      ])
      : [];
  });

  readonly educationFields = computed(() => {
    const employee = this.employee();
    return employee
      ? this.createFields([
        ['Qualification', employee.qualification],
        ['University', employee.university],
      ])
      : [];
  });

  readonly emergencyContactFields = computed(() => {
    const employee = this.employee();
    return employee
      ? this.createFields([
        ['Contact name', employee.emergencyContactName],
        ['Contact number', employee.emergencyContactNumber],
        ['Relationship', employee.emergencyContactRelation],
      ])
      : [];
  });

  readonly recordFields = computed(() => {
    const employee = this.employee();
    return employee
      ? this.createFields([
        ['Record ID', employee.id],
        ['Created at', employee.createdAt],
        ['Updated at', employee.updatedAt],
      ])
      : [];
  });

  private createFields(
    fields: ReadonlyArray<[string, string | number | undefined]>,
  ): EmployeeDetailField[] {
    return fields.map(([label, value]) => ({
      label,
      value: value === undefined || value === '' ? '—' : String(value),
    }));
  }
}
