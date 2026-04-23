import path from 'path';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createTursoClient } from '@libsql/client';
import { MongoClient } from 'mongodb';
import { Pool } from 'pg';

const MASTER_ROOT_DIR = process.env.MASTER_ROOT_DIR || 'f:/Entreprises';

const GLOBAL_STATS_CACHE_TTL_MS = (typeof process !== 'undefined' && process.env.GLOBAL_STATS_CACHE_TTL_SEC)
  ? Math.max(10, parseInt(process.env.GLOBAL_STATS_CACHE_TTL_SEC, 10)) * 1000
  : 60_000;
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
export const drsPool = drsDbUrl ? new Pool({ connectionString: drsDbUrl, max: 5, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 }) : null;

// Re-export all shared types from the client-safe types module
export type { ChartDataPoint, ActivityType, AppActivity, SearchResult, AppStats, OmniTask, EmpireContact, ExpenseItem } from '@/lib/types';
import type { ChartDataPoint, ActivityType, AppActivity, SearchResult, AppStats, OmniTask, EmpireContact, ExpenseItem } from '@/lib/types';


export async function fetchGlobalStats(force: boolean = false): Promise<{ auclaire: AppStats, defcon: AppStats, antigravity: AppStats, drs: AppStats }> {
    const now = Date.now();
    if (!force && globalStatsCache && globalStatsCache.expires > now) return globalStatsCache.data;
    const data = await fetchGlobalStatsUncached();
    globalStatsCache = { data, expires: now + GLOBAL_STATS_CACHE_TTL_MS };
    return data;
}

async function fetchGlobalStatsUncached(): Promise<{ auclaire: AppStats, defcon: AppStats, antigravity: AppStats, drs: AppStats }> {
    const emptyFinancials = { billed: 0, collected: 0, pending: 0, expenses: 0, commissionsPaid: 0, profit: 0 };
    
    const results = {
        auclaire: { id: 'auclaire', name: 'Auclaire APP', users: 0, financials: { ...emptyFinancials }, tasks: 0, chartData: [], activityFeed: [], status: 'offline' } as AppStats,
        defcon: { id: 'defcon', name: 'Defcon App', users: 0, financials: { ...emptyFinancials }, tasks: 0, chartData: [], activityFeed: [], status: 'offline' } as AppStats,
        antigravity: { id: 'antigravity', name: 'Viva Vegas', users: 0, financials: { ...emptyFinancials }, tasks: 0, chartData: [], activityFeed: [], status: 'offline' } as AppStats,
        drs: { id: 'drs', name: 'DRS Auto Detailing', users: 0, financials: { ...emptyFinancials }, tasks: 0, chartData: [], activityFeed: [], status: 'offline' } as AppStats
    };

    // 1. Fetch Auclaire (Supabase)
    if (supabase) {
        try {
            // Count clients for 'users'
            const { count: userCount, error: userError } = await supabase.from('clients').select('*', { count: 'exact', head: true });
            
            // Extract all invoices with project titles
            const { data: invData, error: invError } = await supabase.from('invoices').select(`
                amount, amount_paid, created_at, paid_at, status,
                projects ( title, client_id, clients ( full_name ) )
            `);
            
            // Extract all expenses with descriptions
            const { data: expData, error: expError } = await supabase.from('expenses').select('amount, date, status, created_at, category, description');

            let billed = 0;
            let collected = 0;
            let expensesTotal = 0;
            let commissionsPaid = 0;
            const chartDataMap = new Map<string, { revenue: number, expenses: number }>();

            if (invData) {
                invData.forEach((inv: any) => {
                    const invBilled = Number(inv.amount) || 0;
                    
                    // Logic: If explicitly marked 'paid' or 'completed', it counts even if amount_paid column is zero
                    const statusLower = (inv.status || '').toLowerCase();
                    const isPaid = statusLower === 'paid' || statusLower === 'completed';
                    const invCollected = (inv.amount_paid && inv.amount_paid > 0) ? Number(inv.amount_paid) : (isPaid ? invBilled : 0);
                    
                    billed += invBilled;
                    collected += invCollected;

                    const dateRaw = (isPaid && inv.paid_at) ? inv.paid_at : inv.created_at;
                    if (dateRaw && invCollected > 0) {
                        const dateStr = new Date(dateRaw).toISOString().split('T')[0];
                        const existing = chartDataMap.get(dateStr) || { revenue: 0, expenses: 0 };
                        existing.revenue += invCollected;
                        chartDataMap.set(dateStr, existing);
                    }
                });
            }

            if (expData) {
                expData.forEach(exp => {
                    const statusLower = (exp.status || '').toLowerCase();
                    const isNotCancelled = statusLower !== 'cancelled';
                    if (isNotCancelled) {
                        const expAmount = Number(exp.amount) || 0;
                        expensesTotal += expAmount;
                        
                        if (exp.category === 'commission') {
                            commissionsPaid += expAmount;
                        }

                        const dateRaw = exp.date || exp.created_at;
                        if (dateRaw && expAmount > 0) {
                            const dateStr = new Date(dateRaw).toISOString().split('T')[0];
                            const existing = chartDataMap.get(dateStr) || { revenue: 0, expenses: 0 };
                            existing.expenses += expAmount;
                            chartDataMap.set(dateStr, existing);
                        }
                    }
                });
            }

            const chartData = Array.from(chartDataMap.entries())
                .map(([date, data]) => ({ date, revenue: data.revenue, expenses: data.expenses }))
                .sort((a, b) => a.date.localeCompare(b.date));

            // Generate Activity Feed
            const activities: AppActivity[] = [];
            if (invData) {
                invData.forEach((inv: any) => {
                    const project = Array.isArray(inv.projects) ? inv.projects[0] : inv.projects;
                    const projectTitle = project?.title || 'Unknown Project';
                    const client = Array.isArray(project?.clients) ? project.clients[0] : project?.clients;
                    const clientName = client?.full_name || 'Generic Client';
                    
                    if (inv.created_at) {
                        activities.push({
                            id: `auc-inv-c-${inv.created_at}-${Math.random()}`,
                            appName: 'Auclaire APP',
                            type: 'invoice_created',
                            title: 'Invoice Issued',
                            description: `Invoice for $${inv.amount} generated for ${projectTitle} (${clientName})`,
                            amount: Number(inv.amount),
                            date: new Date(inv.created_at).toISOString()
                        });
                    }
                    if ((inv.status === 'paid' || inv.status === 'completed') && inv.paid_at) {
                        activities.push({
                            id: `auc-inv-p-${inv.paid_at}-${Math.random()}`,
                            appName: 'Auclaire APP',
                            type: 'payment_collected',
                            title: 'Payment Received',
                            description: `Payment of $${inv.amount_paid || inv.amount} collected for ${projectTitle}`,
                            amount: Number(inv.amount_paid || inv.amount),
                            date: new Date(inv.paid_at).toISOString()
                        });
                    }
                });
            }
            if (expData) {
                expData.forEach((exp) => {
                    const statusLower = (exp.status || '').toLowerCase();
                    if (statusLower !== 'cancelled' && (exp.date || exp.created_at)) {
                        activities.push({
                            id: `auc-exp-${exp.date || exp.created_at}-${Math.random()}`,
                            appName: 'Auclaire APP',
                            type: exp.category === 'commission' ? 'commission_paid' : 'expense_logged',
                            title: exp.category === 'commission' ? 'Commission Paid' : 'Expense Logged',
                            description: `${exp.description || 'Miscellaneous expense'} ($${exp.amount}) - ${exp.category || 'General'}`,
                            amount: Number(exp.amount),
                            date: new Date(exp.date || exp.created_at).toISOString()
                        });
                    }
                });
            }
            const activityFeed = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50);

            const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });

            results.auclaire = { 
                name: 'Auclaire APP', status: 'online', users: userCount || 0,
                financials: { billed, collected, pending: billed - collected, expenses: expensesTotal, commissionsPaid, profit: collected - expensesTotal },
                chartData, activityFeed, tasks: projCount || 0
            };
        } catch (e: any) {
            results.auclaire.status = 'error';
            results.auclaire.errorMsg = String(e.message || e);
        }
    }

    // 2. Fetch Defcon (Turso)
    if (turso) {
        try {
            const [userRes, taskRes, paymentRes, serviceRes, costRes, expRes] = await Promise.all([
                turso.execute("SELECT COUNT(*) as count FROM clients"),
                turso.execute("SELECT COUNT(*) as count FROM shoots"),
                turso.execute("SELECT amount, status, date FROM payments"),
                turso.execute("SELECT rate, quantity, project_id FROM project_services"),
                turso.execute("SELECT amount FROM project_costs"),
                turso.execute("SELECT total_amount as amount FROM expenses")
            ]);
            
            let billed = 0, collected = 0, expenses = 0;
            const chartDataMap = new Map<string, number>();
            const activities: AppActivity[] = [];

            // Billed comes from services
            serviceRes.rows.forEach(row => {
                billed += (Number(row.rate) || 0) * (Number(row.quantity) || 1);
            });

            // Collected comes from payments
            paymentRes.rows.forEach(row => {
                const amount = Number(row.amount) || 0;
                const status = String(row.status || '').toLowerCase();
                const dateRaw = String(row.date); 
                if (status === 'paid' || status === 'completed') {
                    collected += amount;
                    if (dateRaw && dateRaw !== 'null') {
                        const dateStr = dateRaw.split('T')[0];
                        chartDataMap.set(dateStr, (chartDataMap.get(dateStr) || 0) + amount);
                        activities.push({
                            id: `def-pay-${dateRaw}-${Math.random()}`, appName: 'Defcon App', type: 'payment_collected',
                            title: 'Payment Received', description: `Payment of $${amount} collected`, amount, date: new Date(dateRaw).toISOString()
                        });
                    }
                }
            });

            // Expenses comes from project_costs and expenses table
            costRes.rows.forEach(row => { expenses += (Number(row.amount) || 0); });
            expRes.rows.forEach(row => { expenses += (Number(row.amount) || 0); });

            results.defcon = {
                id: 'defcon', name: 'Defcon App', status: 'online', users: Number(userRes.rows[0]?.count || 0),
                financials: { billed, collected, pending: billed - collected, expenses, profit: collected - expenses },
                chartData: Array.from(chartDataMap.entries()).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date)),
                activityFeed: activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20),
                tasks: Number(taskRes.rows[0]?.count || 0)
            };
        } catch (e: any) {
            results.defcon.status = 'error';
            results.defcon.errorMsg = String(e.message || e);
        }
    }

    // 3. Fetch Antigravity (MongoDB)
    if (mongoClient) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('travel-agency');
            const userCount = await db.collection('clients').countDocuments({ isArchived: false });
            const items = await db.collection('itineraryitems').find({}).toArray();
            const quotesRes = await db.collection('quotes').find({ status: 'converted' }).toArray();
            const expItems = await db.collection('expenses').find({ status: { $in: ['paid', 'completed'] } }).toArray();

            let billed = 0, expenses = 0, commissionsPaid = 0;
            const chartDataMap = new Map<string, { revenue: number, expenses: number }>();

            quotesRes.forEach(q => {
                const qRev = Number(q.totals?.totalClientPrice) || 0;
                billed += qRev;
                const qDate = q.convertedAt || q.createdAt;
                if (qDate && qRev > 0) {
                    const dateStr = new Date(qDate).toISOString().split('T')[0];
                    const existing = chartDataMap.get(dateStr) || { revenue: 0, expenses: 0 };
                    existing.revenue += qRev;
                    chartDataMap.set(dateStr, existing);
                }
            });

            items.forEach(item => {
                const costPrice = Number(item.costPrice) || 0;
                if (!item.quoteId) {
                    const revenue = (Number(item.cost) || 0) + (Number(item.serviceFee) || 0);
                    billed += revenue;
                    const dateRaw = item.createdAt || item.date;
                    if (dateRaw) {
                        const dateStr = new Date(dateRaw).toISOString().split('T')[0];
                        const existing = chartDataMap.get(dateStr) || { revenue: 0, expenses: 0 };
                        existing.revenue += revenue;
                        existing.expenses += costPrice;
                        chartDataMap.set(dateStr, existing);
                    }
                } else {
                    const dateRaw = item.createdAt || item.date;
                    if (dateRaw) {
                        const dateStr = new Date(dateRaw).toISOString().split('T')[0];
                        const existing = chartDataMap.get(dateStr) || { revenue: 0, expenses: 0 };
                        existing.expenses += costPrice;
                        chartDataMap.set(dateStr, existing);
                    }
                }
                expenses += costPrice;
            });

            expItems.forEach(exp => {
                const expAmount = Number(exp.amount) || 0;
                expenses += expAmount;
                if (exp.category === 'Commission Payout') commissionsPaid += expAmount;
                const dateRaw = exp.date || exp.createdAt;
                if (dateRaw && expAmount > 0) {
                    const dateStr = new Date(dateRaw).toISOString().split('T')[0];
                    const existing = chartDataMap.get(dateStr) || { revenue: 0, expenses: 0 };
                    existing.expenses += expAmount;
                    chartDataMap.set(dateStr, existing);
                }
            });

            results.antigravity = {
                name: 'Viva Vegas', status: 'online', users: userCount,
                financials: { billed, collected: billed, pending: 0, expenses, commissionsPaid, profit: billed - expenses },
                chartData: Array.from(chartDataMap.entries()).map(([date, data]) => ({ date, revenue: data.revenue, expenses: data.expenses })).sort((a, b) => a.date.localeCompare(b.date)),
                activityFeed: [], tasks: items.length
            };
        } catch (e: any) {}
    }

    // 4. Fetch DRS (PostgreSQL Direct)
    if (drsPool) {
        try {
            const [userRes, jobRes, expRes] = await Promise.all([
                drsPool.query('SELECT COUNT(*) as count FROM "ClientProfile"'),
                drsPool.query(`
                    SELECT j.id, j."totalPrice", j.status, j."updatedAt", j."customServiceName", j."customServicePrice",
                           cp."firstName", cp."lastName"
                    FROM "Job" j
                    LEFT JOIN "ClientProfile" cp ON j."clientId" = cp.id
                `),
                drsPool.query('SELECT amount FROM "Expense"')
            ]);

            let billed = 0, collected = 0;
            const chartDataMap = new Map<string, number>();
            const activities: AppActivity[] = [];
            const jobs = jobRes.rows;

            jobs.forEach((job: any) => {
                const price = (Number(job.totalPrice) || 0) + (Number(job.customServicePrice) || 0);
                billed += price;
                const statusLower = (job.status || '').toLowerCase();
                const clientName = job.firstName ? `${job.firstName} ${job.lastName}` : 'Direct Client';
                const jobTitle = job.customServiceName || 'Detailing Job';

                if (statusLower === 'completed' || statusLower === 'paid') {
                    collected += price;
                    if (job.updatedAt) {
                        const dateRaw = new Date(job.updatedAt);
                        if (!isNaN(dateRaw.getTime())) {
                            const dateStr = dateRaw.toISOString().split('T')[0];
                            chartDataMap.set(dateStr, (chartDataMap.get(dateStr) || 0) + price);
                            activities.push({
                                id: `drs-job-${dateRaw.getTime()}-${Math.random()}`, appName: 'DRS Auto Detailing', type: 'payment_collected',
                                title: 'Job Completed', description: `Job "${jobTitle}" for ${clientName} - $${price} collected`, amount: price, date: dateRaw.toISOString()
                            });
                        }
                    }
                }
            });

            const expenses = expRes.rows.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

            results.drs = {
                name: 'DRS Auto Detailing', status: 'online', users: Number(userRes.rows[0]?.count || 0),
                financials: { billed, collected, pending: billed - collected, expenses, profit: collected - expenses },
                chartData: Array.from(chartDataMap.entries()).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date)),
                activityFeed: activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                tasks: jobs.length
            };
        } catch (e: any) {
            results.drs.status = 'error';
            results.drs.errorMsg = String(e.message || e);
        }
    }

    return results;
}



export async function fetchOmniTasks(): Promise<OmniTask[]> {
    const tasks: OmniTask[] = [];
    if (supabase) {
        try {
            // Priority 1: website_tasks
            const { data: webTasks } = await supabase.from('website_tasks').select('*');
            webTasks?.forEach(t => tasks.push({
                id: `auc-w-${t.id}`, appName: 'Auclaire APP', title: t.title,
                status: t.status === 'done' ? 'done' : 'todo',
                priority: (t.priority === 'urgent' || t.priority === 'high') ? 'critical' : 'medium',
                date: t.created_at || new Date().toISOString()
            }));
        } catch (e) {}
    }
    if (turso) {
        try {
            const res = await turso.execute(`
                SELECT s.id, s.title, s.shoot_date, s.start_time, s.end_time, s.color, s.due_date,
                       c.name as client_name, c.company_name as client_company
                FROM shoots s
                LEFT JOIN clients c ON s.client_id = c.id
                ORDER BY s.shoot_date DESC
            `);
            res.rows.forEach(r => {
                const shootDate = String(r.shoot_date || '');
                const startTime = String(r.start_time || '');
                const endTime = String(r.end_time || '');
                const hasTime = !!(startTime && startTime !== 'null');
                
                let parsedDate: Date;
                if (shootDate && hasTime) {
                    parsedDate = new Date(`${shootDate}T${startTime}:00`);
                } else if (shootDate) {
                    parsedDate = new Date(shootDate);
                } else {
                    parsedDate = new Date();
                }
                if (isNaN(parsedDate.getTime())) parsedDate = new Date();

                let parsedEnd: string | undefined;
                if (shootDate && endTime && endTime !== 'null') {
                    const endD = new Date(`${shootDate}T${endTime}:00`);
                    if (!isNaN(endD.getTime())) parsedEnd = endD.toISOString();
                }

                const clientLabel = String(r.client_company || r.client_name || 'Client');

                tasks.push({
                    id: `def-${r.id}`, appName: 'Defcon App',
                    title: String(r.title || 'Untitled Shoot'),
                    status: 'in_progress',
                    priority: 'high',
                    date: parsedDate.toISOString(),
                    endDate: parsedEnd,
                    hasSpecificTime: hasTime,
                    clientName: clientLabel
                });
            });
        } catch (e) {}
    }
    if (drsPool) {
        try {
            const { rows: jobs } = await drsPool.query(`
                SELECT j.id, j.status, j."scheduledDate", j."durationMin", j."totalPrice", j."customServiceName", j."customServicePrice", j.notes,
                       cp."firstName", cp."lastName",
                       v.make as vehicle_make, v.model as vehicle_model
                FROM "Job" j
                LEFT JOIN "ClientProfile" cp ON j."clientId" = cp.id
                LEFT JOIN "Vehicle" v ON j."vehicleId" = v.id
                ORDER BY j."scheduledDate" DESC
            `);
            jobs.forEach((j: any) => {
                const scheduledDate = new Date(j.scheduledDate);
                if (isNaN(scheduledDate.getTime())) return;

                const durationMs = (Number(j.durationMin) || 60) * 60 * 1000;
                const endDate = new Date(scheduledDate.getTime() + durationMs);
                const clientName = j.firstName ? `${j.firstName} ${j.lastName}` : 'Client';
                const vehicleLabel = j.vehicle_make ? `${j.vehicle_make} ${j.vehicle_model}` : '';
                const title = j.customServiceName || (vehicleLabel ? `Detailing — ${vehicleLabel}` : 'Detailing Job');

                tasks.push({
                    id: `drs-${j.id}`, appName: 'DRS Auto Detailing',
                    title,
                    status: j.status === 'COMPLETED' ? 'done' : (j.status === 'CANCELLED' ? 'done' : 'in_progress'),
                    priority: 'medium',
                    date: scheduledDate.toISOString(),
                    endDate: endDate.toISOString(),
                    hasSpecificTime: true,
                    clientName,
                    budget: (Number(j.totalPrice) || 0) + (Number(j.customServicePrice) || 0)
                });
            });
        } catch (e) {}
    }
    if (mongoClient) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('travel-agency');
            const items = await db.collection('itineraryitems').find({}).toArray();
            items.forEach(item => tasks.push({
                id: `vv-${item._id}`, appName: 'Viva Vegas', title: `${item.type || 'Travel Component'} - ${item.name || 'No Name'}`,
                status: 'in_progress', priority: 'medium', date: item.createdAt || new Date().toISOString()
            }));
        } catch (e) {}
    }
    return tasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function fetchOmniCRM(): Promise<EmpireContact[]> {
    const contacts: EmpireContact[] = [];
    
    // 1. Auclaire (Supabase)
    if (supabase) {
        try {
            const { data } = await supabase.from('clients').select('id, full_name, email, phone, created_at').limit(50);
            data?.forEach(c => contacts.push({
                id: `auc-${c.id}`, appName: 'Auclaire APP', name: c.full_name, email: c.email, phone: c.phone || '',
                status: 'active', lifetimeValue: 0, metrics: 'N/A', lastActive: c.created_at || new Date().toISOString()
            }));
        } catch (e) {}
    }

    // 2. Defcon (Turso)
    if (turso) {
        try {
            const res = await turso.execute("SELECT * FROM clients LIMIT 50");
            res.rows.forEach(r => contacts.push({
                id: `def-${r.id}`, appName: 'Defcon App', name: String(r.name || 'Client'), email: String(r.email || ''),
                phone: String(r.phone || ''), status: 'active', lifetimeValue: 0, metrics: 'N/A', lastActive: new Date().toISOString()
            }));
        } catch (e) {}
    }

    // 3. DRS (PostgreSQL)
    if (drsPool) {
        try {
            const { rows } = await drsPool.query(`
                SELECT cp.id, cp."firstName", cp."lastName", u.email, u.phone, cp."userId"
                FROM "ClientProfile" cp
                LEFT JOIN "User" u ON cp."userId" = u.id
                LIMIT 50
            `);
            rows.forEach((c: any) => contacts.push({
                id: `drs-${c.id}`, appName: 'DRS Auto Detailing', name: `${c.firstName} ${c.lastName}`,
                email: c.email || '', phone: c.phone || '', status: 'active', lifetimeValue: 0, metrics: 'N/A', lastActive: new Date().toISOString()
            }));
        } catch (e) {}
    }

    return contacts.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
}

export async function fetchExpenseBreakdown(): Promise<ExpenseItem[]> {
    const items: ExpenseItem[] = [];

    // 1. Auclaire (Supabase)
    if (supabase) {
        try {
            const { data } = await supabase.from('expenses').select('id, category, amount, description, date').order('date', { ascending: false }).limit(100);
            data?.forEach(e => items.push({
                id: `auc-exp-${e.id}`, appName: 'Auclaire APP', category: e.category || 'Général',
                description: e.description || '', amount: Number(e.amount || 0), date: e.date || new Date().toISOString()
            }));
        } catch (e) {}
    }

    // 2. DRS (PostgreSQL)
    if (drsPool) {
        try {
            const { rows } = await drsPool.query('SELECT id, category, description, amount, "createdAt" FROM "Expense" ORDER BY "createdAt" DESC LIMIT 100');
            rows.forEach((e: any) => items.push({
                id: `drs-exp-${e.id}`, appName: 'DRS Auto Detailing', category: e.category || 'Maintenance',
                description: e.description || '', amount: Number(e.amount || 0), date: e.createdAt || new Date().toISOString()
            }));
        } catch (e) {}
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // 1. Auclaire (Supabase)
    if (supabase) {
        try {
            const [clientRes, projectRes] = await Promise.all([
                supabase.from('clients').select('id, full_name, email').or(`full_name.ilike.%${query}%,email.ilike.%${query}%`).limit(5),
                supabase.from('projects').select('id, title').ilike('title', `%${query}%`).limit(5)
            ]);
            clientRes.data?.forEach(c => results.push({ id: `auc-c-${c.id}`, appName: 'Auclaire APP', type: 'client', title: c.full_name, subtitle: c.email }));
            projectRes.data?.forEach(p => results.push({ id: `auc-p-${p.id}`, appName: 'Auclaire APP', type: 'project', title: p.title, subtitle: 'Project' }));
        } catch (e) {}
    }

    // 2. Defcon (Turso)
    if (turso) {
        try {
            const res = await turso.execute({ sql: "SELECT * FROM clients WHERE name LIKE ? LIMIT 5", args: [`%${query}%`] });
            res.rows.forEach(r => results.push({ id: `def-c-${r.id}`, appName: 'Defcon App', type: 'client', title: String(r.name || 'Client'), subtitle: String(r.email || '') }));
        } catch (e) {}
    }

    // 3. DRS (PostgreSQL)
    if (drsPool) {
        try {
            const searchPattern = `%${query}%`;
            const [clientRes, jobRes] = await Promise.all([
                drsPool.query(`SELECT id, "firstName", "lastName" FROM "ClientProfile" WHERE "firstName" ILIKE $1 OR "lastName" ILIKE $1 LIMIT 5`, [searchPattern]),
                drsPool.query(`SELECT id, "customServiceName" FROM "Job" WHERE "customServiceName" ILIKE $1 OR notes ILIKE $1 LIMIT 5`, [searchPattern])
            ]);
            clientRes.rows.forEach((c: any) => results.push({ id: `drs-c-${c.id}`, appName: 'DRS Auto Detailing', type: 'client', title: `${c.firstName} ${c.lastName}`, subtitle: '' }));
            jobRes.rows.forEach((j: any) => results.push({ id: `drs-j-${j.id}`, appName: 'DRS Auto Detailing', type: 'job', title: j.customServiceName || 'Detailing Job', subtitle: 'Detailing Job' }));
        } catch (e) {}
    }

    return results;
}
