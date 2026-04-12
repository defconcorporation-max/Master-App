'use server';

import { fetchOmniCRM, fetchExpenseBreakdown, searchGlobal } from '@/lib/db-clients';
import type { EmpireContact, ExpenseItem, OmniSearchResult } from '@/lib/types';

export async function getOmniCRMData(): Promise<EmpireContact[]> {
    return fetchOmniCRM();
}

export async function getExpenseBreakdownData(): Promise<ExpenseItem[]> {
    return fetchExpenseBreakdown();
}

export async function performGlobalSearch(query: string): Promise<OmniSearchResult[]> {
    return searchGlobal(query);
}
