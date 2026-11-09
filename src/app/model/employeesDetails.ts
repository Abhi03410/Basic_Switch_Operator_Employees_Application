import type { AccountInformation } from './accountInformation';
import type { ContactInformation } from './contactInformation';
import type { EducationInformation } from './educationInformation';
import type { EmergencyContact } from './emergencyContact';
import type { PersonInformation } from './person-Information';
import type { ProfessionalInformation } from './professionalInformation';
import type { SalaryInformation } from './salaryInformation';

export interface EmployeesDetails {
  personalInformation: PersonInformation;
  contactInformation: ContactInformation;
  professionalInformation: ProfessionalInformation;
  salaryInformation: SalaryInformation;
  educationInformation: EducationInformation;
  emergencyContact: EmergencyContact;
  accountInformation: AccountInformation;
}
