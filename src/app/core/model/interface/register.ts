import { UserRole } from "../enums/user-role";

export interface Register {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
}