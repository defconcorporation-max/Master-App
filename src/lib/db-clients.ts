import path from 'path';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createTursoClient } from '@libsql/client';
import { MongoClient } from 'mongodb';

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

// --- DRS Auto Detailing (Supabase) ---
const drsSupabaseUrl = (process.env.DRS_SUPABASE_URL || '').trim();
const drsSupabaseKey = (process.env.DRS_SUPABASE_SERVICE_ROLE_KEY || process.env.DRS_SUPABASE_KEY || '').trim();
export const drsSupabase = drsSupabaseUrl && drsSupabaseKey ? createSupabaseClient(drsSupabaseUrl, drsSupabaseKey) : null;

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
            const userRes = await turso.execute("SELECT COUNT(*) as count FROM clients");
            const taskRes = await turso.execute("SELECT COUNT(*) as count FROM shoots");
            const paymentRes = await turso.execute("SELECT amount, status, date FROM payments");
            
            let billed = 0, collected = 0;
            const chartDataMap = new Map<string, number>();
            const activities: AppActivity[] = [];

            paymentRes.rows.forEach(row => {
                const amount = Number(row.amount) || 0;
                const status = String(row.status || '').toLowerCase();
                const dateRaw = String(row.date); 
                billed += amount;
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

            results.defcon = {
                name: 'Defcon App', status: 'online', users: Number(userRes.rows[0]?.count || 0),
                financials: { billed, collected, pending: billed - collected, expenses: 0, profit: collected },
                chartData: Array.from(chartDataMap.entries()).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date)),
                activityFeed: activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20),
                tasks: Number(taskRes.rows[0]?.count || 0)
            };
        } catch (e: any) {
            results.defcon.status = 'error';
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

    // 4. Fetch DRS (Supabase)
    if (drsSupabase) {
        try {
            const { count: userCount } = await drsSupabase.from('ClientProfile').select('*', { count: 'exact', head: true });
            const { data: jobs } = await drsSupabase.from('Job').select(`
                id, title, totalPrice, status, updatedAt,
                client:ClientProfile ( firstName, lastName )
            `);
            let billed = 0, collected = 0;
            const chartDataMap = new Map<string, number>();
            const activities: AppActivity[] = [];

            if (jobs) {
                jobs.forEach(job => {
                    const price = Number(job.totalPrice) || 0;
                    billed += price;
                    const statusLower = (job.status || '').toLowerCase();
                    const client = Array.isArray(job.client) ? job.client[0] : job.client;
                    const clientName = client ? `${client.firstName} ${client.lastName}` : 'Direct Client';
                    const jobTitle = job.title || 'Detailing Job';

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
            }
            const { data: expData } = await drsSupabase.from('Expense').select('amount');
            const expenses = expData ? expData.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) : 0;

            results.drs = {
                name: 'DRS Auto Detailing', status: 'online', users: userCount || 0,
                financials: { billed, collected, pending: billed - collected, expenses, profit: collected - expenses },
                chartData: Array.from(chartDataMap.entries()).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date)),
                activityFeed: activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                tasks: jobs ? jobs.length : 0
            };
        } catch (e: any) {}
    }

    return results;
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];
    const results: SearchResult[] = [];
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
            const res = await turso.execute("SELECT * FROM shoots");
            res.rows.forEach(r => tasks.push({
                id: `def-${r.id}`, appName: 'Defcon App', title: String(r.title || 'Untitled Shoot'),
                status: String(r.status).toLowerCase().includes('done') ? 'done' : 'in_progress',
                priority: 'high', date: new Date(String(r.date || Date.now())).toISOString()
            }));
        } catch (e) {}
    }
    if (drsSupabase) {
        try {
            const { data: jobs } = await drsSupabase.from('Job').select('*');
            jobs?.forEach(j => tasks.push({
                id: `drs-${j.id}`, appName: 'DRS Auto Detailing', title: j.title || 'Untitled Job',
                status: j.status === 'COMPLETED' ? 'done' : 'in_progress', priority: 'medium', date: j.createdAt || new Date().toISOString()
            }));
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
