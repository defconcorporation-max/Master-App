// Shared types for client/server boundary
// These types are safe to import in 'use client' components since they contain no server-side logic.

export interface ChartDataPoint {
    date: string; // ISO string 'YYYY-MM-DD'
    revenue: number;
    expenses?: number;
}

export type ActivityType = 'invoice_created' | 'payment_collected' | 'expense_logged' | 'project_created' | 'commission_paid' | 'other';

export interface AppActivity {
    id: string;
    appName: string;
    type: ActivityType;
    title: string;
    description: string;
    amount?: number;
    date: string; // ISO string for sorting
    clientName?: string;
    metadata?: string;
}

export interface SearchResult {
    id: string;
    appName: string;
    type: 'client' | 'project' | 'invoice' | 'job' | 'other';
    title: string;
    subtitle?: string;
}

export interface AppStats {
    id?: 'auclaire' | 'defcon' | 'antigravity' | 'drs';
    name: string;
    users: number;
    financials: {
        billed: number;
        collected: number;
        pending: number;
        expenses: number;
        commissionsPaid?: number;
        profit: number;
    };
    tasks: number;
    chartData: ChartDataPoint[];
    activityFeed?: AppActivity[];
    status: 'online' | 'error' | 'offline';
    errorMsg?: string;
}

export interface OmniTask {
    id: string;
    appName: string;
    title: string;
    status: 'backlog' | 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'critical';
    date: string;
    stage?: string;
    jewelryType?: string | null;
    budget?: number;
    clientName?: string;
    endDate?: string;
    hasSpecificTime?: boolean;
}

export interface EmpireContact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    appName: string;
    status: 'vip' | 'active' | 'lead' | 'cold';
    lastActive: string;
    lifetimeValue: number;
    metrics: string;
}

export interface ExpenseItem {
    id: string;
    appName: string;
    category: string;
    description: string;
    amount: number;
    date: string;
}
