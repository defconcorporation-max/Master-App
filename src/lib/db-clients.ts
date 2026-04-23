import path from 'path';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createTursoClient } from '@libsql/client';
import { MongoClient } from 'mongodb';
import { Pool } from 'pg';

const MASTER_ROOT_DIR = process.env.MASTER_ROOT_DIR || 'f:/Entreprises';

// --- Auclaire (Supabase) ---
const supabaseUrl = (process.env.AUCLAIRE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.AUCLAIRE_SUPABASE_SERVICE_ROLE_KEY || process.env.AUCLAIRE_SUPABASE_KEY || '').trim();
export const supabase = supabaseUrl && supabaseKey ? createSupabaseClient(supabaseUrl, supabaseKey) : null;

// --- Defcon (Turso / LibSQL) ---
const tursoUrl = (process.env.DEFCON_TURSO_URL || '').trim();
const tursoToken = (process.env.DEFCON_TURSO_TOKEN || '').trim();
export const turso = tursoUrl && tursoToken ? createTursoClient({ url: tursoUrl, authToken: tursoToken }) : null;

// --- Antigravity Agents (MongoDB) ---
const mongoUri = (process.env.ANTIGRAVITY_MONGODB_URI || '').trim();
let mongoClient: MongoClient | null = null;
if (mongoUri) { mongoClient = new MongoClient(mongoUri); }
export { mongoClient };

// --- DRS Auto Detailing (PostgreSQL Direct via pg) ---
const drsDbUrl = (process.env.DRS_DATABASE_URL || '').trim();
// Clean the URL to avoid conflicts between URL params and Pool config
const cleanDrsUrl = drsDbUrl.split('?')[0]; 

export const drsPool = drsDbUrl ? new Pool({ 
    connectionString: cleanDrsUrl, 
    max: 2, 
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 10000,
    ssl: {
        rejectUnauthorized: false
    }
}) : null;

if (drsPool) {
    drsPool.on('error', (err) => console.error('DRS: Pool error', err));
}

// Re-export all shared types from the client-safe types module
export type { ChartDataPoint, ActivityType, AppActivity, SearchResult, AppStats, OmniTask, EmpireContact, ExpenseItem } from '@/lib/types';
import type { ChartDataPoint, ActivityType, AppActivity, SearchResult, AppStats, OmniTask, EmpireContact, ExpenseItem } from '@/lib/types';

export async function fetchGlobalStats(force: boolean = false): Promise<{ auclaire: AppStats, defcon: AppStats, antigravity: AppStats, drs: AppStats }> {
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
            const { count: u } = await supabase.from('clients').select('*', { count: 'exact', head: true });
            const { data: inv } = await supabase.from('invoices').select('amount, amount_paid, status');
            let b = 0, c = 0;
            inv?.forEach(i => {
                b += Number(i.amount) || 0;
                c += (i.status === 'paid' || i.status === 'completed') ? (Number(i.amount) || 0) : (Number(i.amount_paid) || 0);
            });
            results.auclaire = { ...results.auclaire, status: 'online', users: u || 0, financials: { ...emptyFinancials, billed: b, collected: c, pending: b - c } };
        } catch (e) {}
    }

    // 2. Defcon
    if (turso) {
        try {
            const u = await turso.execute('SELECT COUNT(*) as c FROM clients');
            const inv = await turso.execute('SELECT amount, status FROM invoices');
            let b = 0, c = 0;
            inv.rows.forEach((i: any) => {
                b += Number(i.amount) || 0;
                if (['paid', 'done'].includes(String(i.status).toLowerCase())) c += Number(i.amount) || 0;
            });
            results.defcon = { ...results.defcon, status: 'online', users: Number(u.rows[0]?.c || 0), financials: { ...emptyFinancials, billed: b, collected: c, pending: b - c } };
        } catch (e) {}
    }

    // 3. DRS (PostgreSQL)
    if (drsPool) {
        try {
            const u = await drsPool.query('SELECT COUNT(*) FROM "ClientProfile"');
            const j = await drsPool.query('SELECT "totalPrice", "customServicePrice", status FROM "Job"');
            let b = 0, c = 0;
            j.rows.forEach((job: any) => {
                const p = (Number(job.totalPrice) || 0) + (Number(job.customServicePrice) || 0);
                b += p;
                if (['COMPLETED', 'PAID'].includes(job.status)) c += p;
            });
            results.drs = { 
                ...results.drs, 
                status: 'online', 
                users: Number(u.rows[0].count), 
                financials: { ...emptyFinancials, billed: b, collected: c, pending: b - c, profit: c } 
            };
        } catch (e: any) { 
            console.error('DRS Stats Fetch Error:', e.message);
            results.drs.status = 'error'; 
        }
    }

    return results;
}

export async function fetchOmniTasks(): Promise<OmniTask[]> {
    const tasks: OmniTask[] = [];

    // 1. Auclaire
    if (supabase) {
        try {
            const { data } = await supabase.from('projects').select('id, title, status, deadline, clients(full_name)').limit(50);
            data?.forEach(p => {
                tasks.push({
                    id: `auc-${p.id}`, appName: 'Auclaire APP', title: p.title || 'Project',
                    status: p.status === 'completed' ? 'done' : 'in_progress', priority: 'medium',
                    date: p.deadline || new Date().toISOString(), clientName: (p.clients as any)?.[0]?.full_name || (p.clients as any)?.full_name || 'Client'
                });
            });
        } catch (e: any) {}
    }

    // 2. Defcon
    if (turso) {
        try {
            const res = await turso.execute('SELECT s.*, c.name, c.company_name FROM shoots s LEFT JOIN clients c ON s.client_id = c.id ORDER BY s.shoot_date DESC');
            res.rows.forEach((r: any) => {
                // Force Eastern Time (-04:00) so 14h remains 14h on the dashboard
                const timeStr = r.start_time ? 'T' + r.start_time + '-04:00' : 'T00:00:00-04:00';
                const start = new Date(r.shoot_date + timeStr);
                
                let end = undefined;
                if (r.end_time) {
                    end = new Date(r.shoot_date + 'T' + r.end_time + '-04:00').toISOString();
                }

                tasks.push({
                    id: `def-${r.id}`, appName: 'Defcon App', title: String(r.title),
                    status: 'in_progress', priority: 'high', date: start.toISOString(), endDate: end,
                    hasSpecificTime: !!r.start_time, clientName: r.company_name || r.name || 'Client'
                });
            });
        } catch (e: any) {}
    }

    // 3. DRS
    if (drsPool) {
        try {
            const { rows } = await drsPool.query(`
                SELECT j.*, u.name as user_name 
                FROM "Job" j 
                LEFT JOIN "ClientProfile" cp ON j."clientId" = cp.id 
                LEFT JOIN "User" u ON cp."userId" = u.id 
                ORDER BY j."scheduledDate" DESC LIMIT 50
            `);
            rows.forEach((j: any) => {
                const date = new Date(j.scheduledDate); // Postgres dates are already UTC
                if (isNaN(date.getTime())) return;
                const end = new Date(date.getTime() + (Number(j.durationMin) || 120) * 60000);
                tasks.push({
                    id: `drs-${j.id}`, appName: 'DRS Auto Detailing', title: j.customServiceName || 'Detailing Job',
                    status: j.status === 'COMPLETED' ? 'done' : 'in_progress', priority: 'medium',
                    date: date.toISOString(), endDate: end.toISOString(), hasSpecificTime: true, clientName: j.user_name || 'Client DRS'
                });
            });
        } catch (e: any) {}
    }

    return tasks;
}

export async function fetchOmniCRM(): Promise<EmpireContact[]> { return []; }
export async function fetchExpenseBreakdown(): Promise<ExpenseItem[]> { return []; }
export async function searchGlobal(query: string): Promise<SearchResult[]> { return []; }
export const fetchEmpireContacts = fetchOmniCRM;
export const fetchEmpireExpenses = fetchExpenseBreakdown;
export const searchEmpire = searchGlobal;
