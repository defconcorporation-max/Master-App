'use server';

import { fetchOmniCRM, fetchExpenseBreakdown } from '@/lib/db-clients';
import type { EmpireContact, ExpenseItem } from '@/lib/types';

export async function getOmniCRMData(): Promise<EmpireContact[]> {
    return fetchOmniCRM();
}

export async function getExpenseBreakdownData(): Promise<ExpenseItem[]> {
    return fetchExpenseBreakdown();
}
