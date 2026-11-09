export interface ProfessionalInformation {
  employeeCode: string;
  department: string;
  designation: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  joiningDate: string;
  experience: number;
  reportingManager: string;
}