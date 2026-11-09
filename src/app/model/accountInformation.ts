export interface AccountInformation {
  accountNumber: string;
  accountType: 'Savings' | 'Current' | 'Fixed Deposit' | 'Recurring Deposit';
  bankName: string;
  ifscCode: string;
  branchName: string;
}