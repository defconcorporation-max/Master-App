import path from 'path';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createTursoClient } from '@libsql/client';
import { MongoClient } from 'mongodb';
import Database from 'better-sqlite3';

const MASTER_ROOT_DIR = process.env.MASTER_ROOT_DIR || 'f:/Entreprises';
const getDrsDbPath = () => process.env.DRS_DB_PATH || path.join(MASTER_ROOT_DIR, 'DRS', 'detailing software', 'prisma', 'dev.db');

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
    metadata?: string; // Information about payment type (deposit vs full), invoice description, etc.
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
        commissionsPaid?: number; // Added to explicitly track commissions 
        profit: number;
    };
    tasks: number; // General activity counter
    chartData: ChartDataPoint[];
    activityFeed?: AppActivity[];
    status: 'online' | 'error' | 'offline';
    errorMsg?: string;
}

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
            
            // Extract all invoices to calculate billed, collected, pending, and time-series
            const { data: invData, error: invError } = await supabase.from('invoices').select('*');
            
            // Extract all expenses
            const { data: expData, error: expError } = await supabase.from('expenses').select('*');

            let billed = 0;
            let collected = 0;
            let expensesTotal = 0;
            let commissionsPaid = 0;
            const chartDataMap = new Map<string, { revenue: number, expenses: number }>();

            if (invData) {
                invData.forEach(inv => {
                    const invBilled = Number(inv.amount) || 0;
                    const invCollected = Number(inv.amount_paid) || 0;
                    
                    billed += invBilled;
                    collected += invCollected;
 
                    // Case-insensitive status check
                    const statusLower = (inv.status || '').toLowerCase();
                    const isPaid = statusLower === 'paid' || statusLower === 'completed';

                    // Time-series: We attribute 'collected' to the paid_at date if exists, otherwise created_at
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
                    const isPaid = statusLower === '' || statusLower === 'paid' || statusLower === 'completed';
                    if (isPaid) {
                        const expAmount = Number(exp.amount) || 0;
                        expensesTotal += expAmount;
                        
                        // Extract specifically 'commission' category
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
                invData.forEach((inv, i) => {
                    if (inv.created_at) {
                        activities.push({
                            id: `auc-inv-c-${inv.created_at}-${Math.random()}`,
                            appName: 'Auclaire APP',
                            type: 'invoice_created',
                            title: 'Invoice Issued',
                            description: `An invoice for $${inv.amount} was generated`,
                            amount: Number(inv.amount),
                            date: new Date(inv.created_at).toISOString()
                        });
                    }
                    if (inv.status === 'paid' && inv.paid_at) {
                        activities.push({
                            id: `auc-inv-p-${inv.paid_at}-${Math.random()}`,
                            appName: 'Auclaire APP',
                            type: 'payment_collected',
                            title: 'Payment Received',
                            description: `Payment of $${inv.amount_paid} collected`,
                            amount: Number(inv.amount_paid),
                            date: new Date(inv.paid_at).toISOString(),
                            clientName: inv.client_name || inv.clientName || inv.customer_name || 'Client Inconnu',
                            metadata: inv.type || inv.description || (inv.amount_paid < inv.amount ? 'Deposit' : 'Full Payment')
                        });
                    }
                });
            }
            if (expData) {
                expData.forEach((exp, i) => {
                    const isPaid = !exp.status || exp.status === 'paid';
                    if (isPaid && (exp.date || exp.created_at)) {
                        activities.push({
                            id: `auc-exp-${exp.date || exp.created_at}-${Math.random()}`,
                            appName: 'Auclaire APP',
                            type: exp.category === 'commission' ? 'commission_paid' : 'expense_logged',
                            title: exp.category === 'commission' ? 'Commission Paid' : 'Expense Logged',
                            description: exp.description || `Expense of $${exp.amount} recorded`,
                            amount: Number(exp.amount),
                            date: new Date(exp.date || exp.created_at).toISOString(),
                            metadata: exp.category || 'General Expense'
                        });
                    }
                });
            }
            // Sort Descending (Removed slice to supply full data to calendar)
            const activityFeed = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // Count total projects for 'tasks'
            const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });

            if (userError && userError.code !== '42P01') throw userError;
            if (invError && invError.code !== '42P01') throw invError;
            if (expError && expError.code !== '42P01') throw expError;

            results.auclaire = { 
                name: 'Auclaire APP', 
                status: 'online',
                users: userCount || 0,
                financials: {
                    billed,
                    collected,
                    pending: billed - collected,
                    expenses: expensesTotal,
                    commissionsPaid,
                    profit: collected - expensesTotal
                },
                chartData,
                activityFeed,
                tasks: projCount || 0
            };
        } catch (e: any) {
            results.auclaire.status = 'error';
            results.auclaire.errorMsg = typeof e === 'object' ? JSON.stringify(e, null, 2) : String(e);
        }
    } else {
        results.auclaire.status = 'error';
        results.auclaire.errorMsg = `Configuration Error: AUCLAIRE_SUPABASE_URL or Key is missing.`;
    }

    // 2. Fetch Defcon (Turso)
    if (turso) {
        try {
            const userRes = await turso.execute("SELECT COUNT(*) as count FROM clients");
            const taskRes = await turso.execute("SELECT COUNT(*) as count FROM shoots");
            
            // Get all payments using SELECT * to allow harvesting of client names and metadata
            const paymentRes = await turso.execute("SELECT * FROM payments");
            
            let billed = 0;
            let collected = 0;
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
                            id: `def-pay-${dateRaw}-${Math.random()}`,
                            appName: 'Defcon App',
                            type: 'payment_collected',
                            title: 'Payment Received',
                            description: row.description ? String(row.description) : `Payment of $${amount} collected`,
                            amount,
                            date: new Date(dateRaw).toISOString(),
                            clientName: row.client_name || row.contact_name ? String(row.client_name || row.contact_name) : undefined,
                            metadata: row.type || row.payment_type ? String(row.type || row.payment_type) : undefined
                        });
                    }
                }
            });

            const activityFeed = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const chartData = Array.from(chartDataMap.entries())
                .map(([date, revenue]) => ({ date, revenue }))
                .sort((a, b) => a.date.localeCompare(b.date));

            const userCount = Number(userRes.rows[0]?.count || 0);
            const taskCount = Number(taskRes.rows[0]?.count || 0);

            results.defcon = {
                name: 'Defcon App',
                status: 'online',
                users: userCount,
                financials: {
                    billed,
                    collected,
                    pending: billed - collected,
                    expenses: 0,
                    profit: collected
                },
                chartData,
                activityFeed,
                tasks: taskCount
            };
        } catch (e: any) {
            results.defcon.status = 'error';
            results.defcon.errorMsg = String(e.message || e);
        }
    } else {
        results.defcon.status = 'error';
        results.defcon.errorMsg = `Configuration Error: DEFCON_TURSO_URL or Token is missing.`;
    }

    // 3. Fetch Antigravity (MongoDB)
    if (mongoClient) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('travel-agency');
            
            // Count users
            const userCount = await db.collection('clients').countDocuments({ isArchived: false });
            
            // Sum revenue from ItineraryItems
            const items = await db.collection('itineraryitems').find({}).toArray();
            
            // ALSO fetch Converted Quotes for higher accuracy (Primary revenue source)
            const quotesRes = await db.collection('quotes').find({ status: 'converted' }).toArray();
            
            // Sum true operational expenses
            const expItems = await db.collection('expenses').find({ status: { $in: ['paid', 'completed'] } }).toArray();

            let billed = 0;
            let expenses = 0;
            let commissionsPaid = 0;
            const chartDataMap = new Map<string, { revenue: number, expenses: number }>();
            const activities: AppActivity[] = [];

            // 1. Process Quotes (Main Revenue)
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

            // 2. Process Itinerary Items (Markup + COGS)
            items.forEach(item => {
                const cost = Number(item.cost) || 0;
                const serviceFee = Number(item.serviceFee) || 0;
                const costPrice = Number(item.costPrice) || 0;
                
                // If it's an isolated item (not tied to a quote already counted), add its revenue
                if (!item.quoteId) {
                    const revenue = cost + serviceFee;
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
                    // Item expense (COGS) still counts against the quote revenue
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

            // 3. Process Operational Expenses
            expItems.forEach(exp => {
                const expAmount = Number(exp.amount) || 0;
                expenses += expAmount;
                if (exp.category === 'Commission Payout') {
                    commissionsPaid += expAmount;
                }
                const dateRaw = exp.date || exp.createdAt;
                if (dateRaw && expAmount > 0) {
                    const dateStr = new Date(dateRaw).toISOString().split('T')[0];
                    const existing = chartDataMap.get(dateStr) || { revenue: 0, expenses: 0 };
                    existing.expenses += expAmount;
                    chartDataMap.set(dateStr, existing);
                }
            });

            const activityFeed = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const chartData = Array.from(chartDataMap.entries())
                .map(([date, data]) => ({ date, revenue: data.revenue, expenses: data.expenses }))
                .sort((a, b) => a.date.localeCompare(b.date));

            // Count total items for tasks
            const taskCount = items.length;

            results.antigravity = {
                name: 'Viva Vegas',
                status: 'online',
                users: userCount,
                financials: {
                    billed,
                    collected: billed, // Assuming all itinerary items represent collected cash
                    pending: 0,
                    expenses,
                    commissionsPaid,
                    profit: billed - expenses
                },
                chartData,
                activityFeed,
                tasks: taskCount
            };
        } catch (e: any) {
            results.antigravity.status = 'error';
            results.antigravity.errorMsg = String(e.message || e);
        }
    } else {
        results.antigravity.status = 'error';
        results.antigravity.errorMsg = `Configuration Error: ANTIGRAVITY_MONGODB_URI is missing.`;
    }

path.join(MASTER_ROOT_DIR, 'DRS', 'detailing software', 'prisma', 'dev.db');
    // 4. Fetch DRS (Supabase)
    if (drsSupabase) {
        try {
            // Fetch users (ClientProfile)
            const { count: userCount } = await drsSupabase.from('ClientProfile').select('*', { count: 'exact', head: true });
            
            // Fetch jobs
            const { data: jobs } = await drsSupabase.from('Job').select('*');
            
            let billed = 0;
            let collected = 0;
            const chartDataMap = new Map<string, number>();
            const activities: AppActivity[] = [];

            if (jobs) {
                jobs.forEach(job => {
                    const price = Number(job.totalPrice) || 0;
                    billed += price;
                    const statusLower = (job.status || '').toLowerCase();
                    if (statusLower === 'completed' || statusLower === 'paid') {
                        collected += price;
                        if (job.updatedAt) {
                            const dateRaw = new Date(job.updatedAt);
                            if (!isNaN(dateRaw.getTime())) {
                                const dateStr = dateRaw.toISOString().split('T')[0];
                                chartDataMap.set(dateStr, (chartDataMap.get(dateStr) || 0) + price);
                                activities.push({
                                    id: `drs-job-${dateRaw.getTime()}-${Math.random()}`,
                                    appName: 'DRS Auto Detailing',
                                    type: 'payment_collected',
                                    title: 'Job Completed',
                                    description: job.title ? `Job: ${job.title}` : `Detailing job of $${price} completed`,
                                    amount: price,
                                    date: dateRaw.toISOString(),
                                    clientName: job.clientName || job.client_name || job.firstName || undefined,
                                    metadata: job.serviceType || job.package || 'Detailing Service'
                                });
                            }
                        }
                    }
                });
            }

            // Fetch expenses
            const { data: expData } = await drsSupabase.from('Expense').select('amount');
            const expenses = expData ? expData.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) : 0;

            const chartData = Array.from(chartDataMap.entries())
                .map(([date, revenue]) => ({ date, revenue }))
                .sort((a, b) => a.date.localeCompare(b.date));

            results.drs = {
                name: 'DRS Auto Detailing',
                status: 'online',
                users: userCount || 0,
                financials: {
                    billed,
                    collected,
                    pending: billed - collected,
                    expenses,
                    profit: collected - expenses
                },
                chartData,
                activityFeed: activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                tasks: jobs ? jobs.length : 0
            };
        } catch (e: any) {
            results.drs.status = 'error';
            results.drs.errorMsg = `Could not connect to DRS Supabase: ${e.message}`;
        }
    } else {
        results.drs.status = 'error';
        results.drs.errorMsg = `Configuration Error: DRS_SUPABASE_URL or Key is missing.`;
    }

    return results;
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // 1. Search Auclaire (Supabase)
    if (supabase) {
        try {
            const [clientRes, projectRes] = await Promise.all([
                supabase.from('clients').select('id, name, email').or(`name.ilike.%${query}%,email.ilike.%${query}%`).limit(5),
                supabase.from('projects').select('id, name').ilike('name', `%${query}%`).limit(5)
            ]);

            if (clientRes.data) {
                clientRes.data.forEach(c => results.push({
                    id: `auc-c-${c.id}`,
                    appName: 'Auclaire APP',
                    type: 'client',
                    title: c.name,
                    subtitle: c.email
                }));
            }
            if (projectRes.data) {
                projectRes.data.forEach(p => results.push({
                    id: `auc-p-${p.id}`,
                    appName: 'Auclaire APP',
                    type: 'project',
                    title: p.name,
                    subtitle: 'Project'
                }));
            }
        } catch (e) {}
    }

    // 2. Search Defcon (Turso)
    if (turso) {
        try {
            const clientRes = await turso.execute({
                sql: "SELECT id, name, email FROM clients WHERE name LIKE ? OR email LIKE ? LIMIT 5",
                args: [`%${query}%`, `%${query}%`]
            });
            const shootRes = await turso.execute({
                sql: "SELECT id, title FROM shoots WHERE title LIKE ? LIMIT 5",
                args: [`%${query}%`]
            });

            clientRes.rows.forEach(r => results.push({
                id: `def-c-${r.id}`,
                appName: 'Defcon App',
                type: 'client',
                title: String(r.name),
                subtitle: String(r.email)
            }));
            shootRes.rows.forEach(r => results.push({
                id: `def-s-${r.id}`,
                appName: 'Defcon App',
                type: 'project',
                title: String(r.title),
                subtitle: 'Photoshoot'
            }));
        } catch (e) {}
    }

    // 3. Search Antigravity (MongoDB)
    if (mongoClient) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('travel-agency');
            const clients = await db.collection('clients').find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            }).limit(5).toArray();

            clients.forEach(c => results.push({
                id: `vv-c-${c._id}`,
                appName: 'Viva Vegas',
                type: 'client',
                title: c.name,
                subtitle: c.email
            }));
        } catch (e) {}
    }

    // 4. Search DRS (Supabase)
    if (drsSupabase) {
        try {
            const [clientRes, jobRes] = await Promise.all([
                drsSupabase.from('ClientProfile').select('id, firstName, lastName, email').or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%,email.ilike.%${query}%`).limit(5),
                drsSupabase.from('Job').select('id, title').ilike('title', `%${query}%`).limit(5)
            ]);

            clientRes.data?.forEach(c => results.push({
                id: `drs-c-${c.id}`,
                appName: 'DRS Auto Detailing',
                type: 'client',
                title: `${c.firstName} ${c.lastName}`,
                subtitle: c.email
            }));
            jobRes.data?.forEach(j => results.push({
                id: `drs-j-${j.id}`,
                appName: 'DRS Auto Detailing',
                type: 'job',
                title: j.title || 'Untitled Job',
                subtitle: 'Detailing Job'
            }));
        } catch (e) {}
    }

    return results;
}

export interface OmniTask {
    id: string;
    appName: string;
    title: string;
    status: 'backlog' | 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'critical';
    date: string;
    stage?: string;        // Auclaire pipeline: designing, 3d_model, production, delivery, etc.
    jewelryType?: string | null;  // Bague, Collier, Bracelet, etc.
    budget?: number;       // Sale price
    clientName?: string;
}

export async function fetchOmniTasks(): Promise<OmniTask[]> {
    const tasks: OmniTask[] = [];

    // 1. Auclaire (Projects — full pipeline)
    if (supabase) {
        try {
            // Using * is safer if columns change, but let's stick to what we know exists
            const { data } = await supabase.from('projects').select('*');
            data?.forEach(p => {
                const pStatus = p.status || 'designing';
                let omniStatus: OmniTask['status'] = 'in_progress';
                if (pStatus === 'completed') omniStatus = 'done';
                else if (pStatus === 'designing' || pStatus === 'design_modification') omniStatus = 'todo';

                let omniPriority: OmniTask['priority'] = 'medium';
                if (p.priority === 'rush') omniPriority = 'critical';

                tasks.push({
                    id: `auc-${p.id}`,
                    appName: 'Auclaire APP',
                    title: p.title || p.name || 'Sans titre',
                    status: omniStatus,
                    priority: omniPriority,
                    date: p.created_at || new Date().toISOString(),
                    stage: pStatus,
                    jewelryType: p.jewelry_type || null,
                    budget: Number(p.budget || p.amount || 0),
                    clientName: p.client_name || p.clientName || undefined
                });
            });
        } catch (e) {
            console.error("Auclaire Tasks Fetch Error:", e);
        }
    }

    // 2. Defcon (Shoots)
    if (turso) {
        try {
            // Unsafe query replaced! Using SELECT * avoids crashing if strict columns (like 'date' or 'status') do not exist.
            const res = await turso.execute("SELECT * FROM shoots");
            res.rows.forEach(r => {
                const dateRaw = r.date || r.shoot_date || r.created_at || r.createdAt;
                tasks.push({
                    id: `def-${r.id || r.shoot_id || Math.random()}`,
                    appName: 'Defcon App',
                    title: String(r.title || r.name || 'Untitled Shoot'),
                    status: String(r.status || r.state || 'in_progress').toLowerCase().includes('done') ? 'done' : 'in_progress',
                    priority: 'high',
                    date: dateRaw ? String(dateRaw) : new Date().toISOString(), // Fallback directly preventing NaN/invalid parsing later
                    clientName: r.contact_name ? String(r.contact_name) : undefined,
                    budget: Number(r.budget || r.price || r.amount || 0)
                });
            });
        } catch (e) {
            console.error("Defcon Tasks Fetch Error:", e);
        }
    }

    // 3. DRS (Supabase)
    if (drsSupabase) {
        try {
            const { data: jobs } = await drsSupabase.from('Job').select('*');
            jobs?.forEach(j => tasks.push({
                id: `drs-${j.id}`,
                appName: 'DRS Auto Detailing',
                title: j.title || j.name || 'Untitled Job',
                status: j.status === 'COMPLETED' ? 'done' : 'in_progress',
                priority: 'medium',
                date: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
                budget: Number(j.totalPrice || j.price || 0),
            }));
        } catch (e) {
            console.error("DRS Tasks Fetch Error:", e);
        }
    }

    // 4. Antigravity (MongoDB)
    if (mongoClient) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('travel-agency');
            const items = await db.collection('itineraryitems').find({}).toArray();
            items.forEach(item => tasks.push({
                id: `vv-${item._id}`,
                appName: 'Viva Vegas',
                title: `${item.type || 'Travel Component'} - ${item.name || 'No Name'}`,
                status: 'in_progress',
                priority: 'medium',
                date: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
            }));
        } catch (e) {}
    }

    return tasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export interface OmniClient {
    id: string;
    name: string;
    email: string;
    appName: string;
    status: 'active' | 'inactive' | 'lead';
    lastActive: string;
}

export async function fetchGlobalClients(): Promise<OmniClient[]> {
    const clients: OmniClient[] = [];

    // 1. Auclaire (Users / Clients)
    if (supabase) {
        try {
            const { data } = await supabase.from('users').select('id, name, email, created_at');
            data?.forEach(u => clients.push({
                id: `auc-${u.id}`,
                name: u.name || 'Anonymous',
                email: u.email || 'no-email',
                appName: 'Auclaire APP',
                status: 'active',
                lastActive: u.created_at
            }));
        } catch (e) {}
    }

    // 2. Defcon (Shoots - extracting unique contacts)
    if (turso) {
        try {
            const res = await turso.execute("SELECT DISTINCT contact_name, contact_email, date FROM shoots");
            res.rows.forEach(r => clients.push({
                id: `def-${r.contact_email}`,
                name: String(r.contact_name),
                email: String(r.contact_email),
                appName: 'Defcon App',
                status: 'active',
                lastActive: String(r.date)
            }));
        } catch (e) {}
    }

    // 3. DRS (Supabase)
    if (drsSupabase) {
        try {
            const { data } = await drsSupabase.from('ClientProfile').select('id, firstName, lastName, email, createdAt');
            data?.forEach(c => clients.push({
                id: `drs-${c.id}`,
                name: `${c.firstName} ${c.lastName}`,
                email: c.email || 'no-email',
                appName: 'DRS Auto Detailing',
                status: 'active',
                lastActive: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString()
            }));
        } catch (e) {}
    }

    return clients.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
}
