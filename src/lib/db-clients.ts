import path from 'path';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createTursoClient } from '@libsql/client';
import { MongoClient } from 'mongodb';
import { Pool } from 'pg';

const MASTER_ROOT_DIR = process.env.MASTER_ROOT_DIR || 'f:/Entreprises';

const GLOBAL_STATS_CACHE_TTL_MS = 2000; 
let globalStatsCache: { data: Awaited<ReturnType<typeof fetchGlobalStatsUncached>>; expires: number } | null = null;

// --- Auclaire (Supabase) ---
const supabaseUrl = (process.env.AUCLAIRE_SUPABASE_URL || '').trim();
const rawRoleKey = (process.env.AUCLAIRE_SUPABASE_SERVICE_ROLE_KEY || '').trim();
const supabaseKey = (rawRoleKey && rawRoleKey !== 'AJOUTER_VOTRE_CLE_SERVICE_ROLE_ICI') 
    ? rawRoleKey 
    : (process.env.AUCLAIRE_SUPABASE_KEY || '').trim();
export const supabase = supabaseUrl && supabaseKey ? createSupabaseClient(supabaseUrl, supabaseKey) : null;

// --- Defcon (Turso / LibSQL) ---
const tursoUrl = (process.env.DEFCON_TURSO_URL || '').trim();
const tursoToken = (process.env.DEFCON_TURSO_TOKEN || '').trim();
export const turso = tursoUrl && tursoToken ? createTursoClient({ url: tursoUrl, authToken: tursoToken }) : null;

// --- Antigravity Agents (MongoDB) ---
const mongoUri = (process.env.ANTIGRAVITY_MONGODB_URI || '').trim();
let mongoClient: MongoClient | null = null;
if (mongoUri) {
  mongoClient = new MongoClient(mongoUri);
}
export { mongoClient };

// --- DRS Auto Detailing (PostgreSQL Direct via pg) ---
const drsDbUrl = (process.env.DRS_DATABASE_URL || '').trim();
export const drsPool = drsDbUrl ? new Pool({ 
    connectionString: drsDbUrl, 
    max: 10, 
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
}) : null;

if (drsPool) {
    drsPool.on('error', (err) => console.error('DRS: Pool error', err));
}

// Re-export all shared types from the client-safe types module
export type { ChartDataPoint, ActivityType, AppActivity, SearchResult, AppStats, OmniTask, EmpireContact, ExpenseItem } from '@/lib/types';
import type { ChartDataPoint, ActivityType, AppActivity, SearchResult, AppStats, OmniTask, EmpireContact, ExpenseItem } from '@/lib/types';


export async function fetchGlobalStats(force: boolean = false): Promise<{ auclaire: AppStats, defcon: AppStats, antigravity: AppStats, drs: AppStats }> {
    return await fetchGlobalStatsUncached();
}

async function fetchGlobalStatsUncached(): Promise<{ auclaire: AppStats, defcon: AppStats, antigravity: AppStats, drs: AppStats }> {
    const emptyFinancials = { billed: 0, collected: 0, pending: 0, expenses: 0, commissionsPaid: 0, profit: 0 };
    
    const results = {
        auclaire: { id: 'auclaire', name: 'Auclaire APP', users: 0, financials: { ...emptyFinancials }, tasks: 0, chartData: [], activityFeed: [], status: 'offline' } as AppStats,
        defcon: { id: 'defcon', name: 'Defcon App', users: 0, financials: { ...emptyFinancials }, tasks: 0, chartData: [], activityFeed: [], status: 'offline' } as AppStats,
        antigravity: { id: 'antigravity', name: 'Viva Vegas', users: 0, financials: { ...emptyFinancials }, tasks: 0, chartData: [], activityFeed: [], status: 'offline' } as AppStats,
        drs: { id: 'drs', name: 'DRS Auto Detailing', users: 0, financials: { ...emptyFinancials }, tasks: 0, chartData: [], activityFeed: [], status: 'offline' } as AppStats
    };

    // 1. Auclaire
    if (supabase) {
        try {
            const { count: userCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
            const { data: invData } = await supabase.from('invoices').select('amount, amount_paid, status');
            const { data: expData } = await supabase.from('expenses').select('amount');
            let billed = 0, collected = 0;
            invData?.forEach(inv => {
                billed += Number(inv.amount) || 0;
                collected += (inv.status === 'paid' || inv.status === 'completed') ? (Number(inv.amount) || 0) : (Number(inv.amount_paid) || 0);
            });
            const expenses = expData?.reduce((s, e) => s + (Number(e.amount) || 0), 0) || 0;
            results.auclaire = { ...results.auclaire, status: 'online', users: userCount || 0, financials: { ...emptyFinancials, billed, collected, pending: billed - collected, expenses, profit: collected - expenses } };
        } catch (e) {}
    }

    // 2. Defcon
    if (turso) {
        try {
            const userRes = await turso.execute('SELECT COUNT(*) as count FROM clients');
            const invRes = await turso.execute('SELECT amount, status FROM invoices');
            let billed = 0, collected = 0;
            invRes.rows.forEach((inv: any) => {
                billed += Number(inv.amount) || 0;
                if (String(inv.status).toLowerCase().includes('paid') || String(inv.status).toLowerCase().includes('done')) {
                    collected += Number(inv.amount) || 0;
                }
            });
            results.defcon = { ...results.defcon, status: 'online', users: Number(userRes.rows[0]?.count || 0), financials: { ...emptyFinancials, billed, collected, pending: billed - collected, profit: collected } };
        } catch (e) {}
    }

    // 3. DRS
    if (drsPool) {
        try {
            const [userRes, jobRes, expRes] = await Promise.all([
                drsPool.query('SELECT COUNT(*) as count FROM "ClientProfile"'),
                drsPool.query('SELECT "totalPrice", "customServicePrice", status FROM "Job"'),
                drsPool.query('SELECT amount FROM "Expense"')
            ]);
            let billed = 0, collected = 0;
            jobRes.rows.forEach((job: any) => {
                const price = (Number(job.totalPrice) || 0) + (Number(job.customServicePrice) || 0);
                billed += price;
                if (['COMPLETED', 'PAID'].includes(job.status)) collected += price;
            });
            const expenses = expRes.rows.reduce((s, e) => s + (Number(e.amount) || 0), 0);
            results.drs = { ...results.drs, status: 'online', users: Number(userRes.rows[0]?.count || 0), financials: { ...emptyFinancials, billed, collected, pending: billed - collected, expenses, profit: collected - expenses } };
        } catch (e) {
            results.drs.status = 'error';
        }
    }

    return results;
}

export async function fetchOmniTasks(): Promise<OmniTask[]> {
    const tasks: OmniTask[] = [];

    // Defcon
    if (turso) {
        try {
            const res = await turso.execute(`
                SELECT s.id, s.title, s.shoot_date, s.start_time, s.end_time, c.company_name, c.name
                FROM shoots s
                LEFT JOIN clients c ON s.client_id = c.id
            `);
            res.rows.forEach((r: any) => {
                const date = new Date(r.shoot_date + (r.start_time ? 'T' + r.start_time : ''));
                tasks.push({
                    id: `def-${r.id}`, appName: 'Defcon App', title: String(r.title),
                    status: 'in_progress', priority: 'high', date: date.toISOString(),
                    hasSpecificTime: !!r.start_time, clientName: r.company_name || r.name || 'Client'
                });
            });
        } catch (e) {}
    }

    // DRS
    if (drsPool) {
        try {
            const { rows } = await drsPool.query(`
                SELECT j.id, j.status, j."scheduledDate", j."durationMin", j."customServiceName", j."totalPrice", j."customServicePrice",
                       u.name as user_name
                FROM "Job" j
                LEFT JOIN "ClientProfile" cp ON j."clientId" = cp.id
                LEFT JOIN "User" u ON cp."userId" = u.id
                ORDER BY j."scheduledDate" DESC LIMIT 50
            `);
            rows.forEach((j: any) => {
                const date = new Date(j.scheduledDate);
                if (isNaN(date.getTime())) return;
                tasks.push({
                    id: `drs-${j.id}`, appName: 'DRS Auto Detailing', title: j.customServiceName || 'Detailing Job',
                    status: j.status === 'COMPLETED' ? 'done' : 'in_progress', priority: 'medium',
                    date: date.toISOString(), hasSpecificTime: true, clientName: j.user_name || 'Client DRS'
                });
            });
        } catch (e) {
            console.error('DRS Task Fetch Error:', e);
        }
    }

    return tasks;
}

// REQUIRED BY server-actions.ts
export async function fetchOmniCRM(): Promise<EmpireContact[]> { return []; }
export async function fetchExpenseBreakdown(): Promise<ExpenseItem[]> { return []; }
export async function searchGlobal(query: string): Promise<SearchResult[]> { return []; }
// Aliases for compatibility
export const fetchEmpireContacts = fetchOmniCRM;
export const fetchEmpireExpenses = fetchExpenseBreakdown;
export const searchEmpire = searchGlobal;
