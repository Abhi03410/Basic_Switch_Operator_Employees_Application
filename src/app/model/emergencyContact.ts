export interface EmergencyContact {
  name: string;
  relationship: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}