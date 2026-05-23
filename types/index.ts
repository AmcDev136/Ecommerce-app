export interface ApiResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface SafeUser {
    id: string;
    email: string;
    name: string | null;
    role: "ADMIN" | "CLIENTE";
    createdAt: Date;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
}