export type UserRole = 'Admin' | 'User';

export type UserStatus = 'Pending' | 'Approved' | 'Rejected';

export type User = {
    id: number;
    username: string;
    email?: string;
    role: UserRole;
    status?: UserStatus;
};

export type ItemStatus = 'Available' | 'Assigned' | 'Maintenance';

export type LogisticStatus = 'Pending' | 'In Progress' | 'Completed';

export type LogisticsItem = {
    id: number;
    name: string;
    category: string;
    event: string | null;
    quantity: number;
    city: string;
    status: ItemStatus;
    logistic_status?: LogisticStatus;
    assigned_to: number | null;
    assigned_to_username: string | null;
    last_updated: string;
};

export type ItemHistory = {
    id: number;
    item_id: number;
    user_id: number;
    username: string;
    action: string;
    timestamp: string;
};

export type DashboardStats = {
    total: number;
    available: number;
    assigned: number;
    byCity: { city: string, count: number }[];
};
