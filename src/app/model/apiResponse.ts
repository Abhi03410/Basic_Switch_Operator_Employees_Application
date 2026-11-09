export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    statusCode: number;
}

// Here, T is a generic type.

// For example:
// - APIResponse<Employee[]> – Employee list.
// - APIResponse<Employee> – Single employee.
// - APIResponse<string> – String response.