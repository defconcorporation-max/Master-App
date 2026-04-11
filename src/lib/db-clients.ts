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
            // In Auclaire, invoices might be linked to 'projects', 'clients', or 'users'.
            // Let's fetch all of them and build a Universal ID Resolver.
            let userCount = 0;
            const clientMap = new Map<string, any>();
            
            const resClients = await supabase.from('clients').select('*');
            const resUsers = await supabase.from('users').select('*');
            const resProjects = await supabase.from('projects').select('*');

            if (resClients.data) {
                resClients.data.forEach((c: any) => clientMap.set(c.id, { ...c, _type: 'client' }));
                userCount = resClients.data.length;
            }
            if (resUsers.data) {
                resUsers.data.forEach((u: any) => clientMap.set(u.id, { ...u, _type: 'user' }));
                if (userCount === 0) userCount = resUsers.data.length;
            }
            if (resProjects.data) {
                resProjects.data.forEach((p: any) => clientMap.set(p.id, { ...p, _type: 'project' }));
            }
            
            // Helper to dig out a name from any entity ID
            const resolveName = (id: any): string | null => {
                if (!id) return null;
                const entity = clientMap.get(id);
                if (!entity) return null;
                if (entity.name || entity.full_name || entity.client_name || entity.first_name) {
                    return entity.name || entity.full_name || entity.client_name || [entity.first_name, entity.last_name].filter(Boolean).join(' ');
                }
                if (entity._type === 'project') {
                    // Try to resolve the client of this project
                    return resolveName(entity.client_id || entity.clientId || entity.user_id) || entity.title || entity.name;
                }
                return null;
            };
            
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
                    // Invoices might link directly to client/user, or to a project! 
                    const linkedId = inv.client_id || inv.clientId || inv.user_id || inv.userId || inv.customer_id || inv.project_id || inv.projectId;
                    
                    // Attempt resolution via lookup, or use hardcoded name directly on invoice
                    const resolvedClientName = resolveName(linkedId) || (inv.client_name || inv.clientName || inv.customer_name || 'Client Inconnu');

                    if (inv.created_at) {
                        activities.push({
                            id: `auc-inv-c-${inv.created_at}-${Math.random()}`,
                            appName: 'Auclaire APP',
                            type: 'invoice_created',
                            title: 'Invoice Issued',
                            description: `An invoice for $${inv.amount} was generated`,
                            amount: Number(inv.amount),
                            date: new Date(inv.created_at).toISOString(),
                            clientName: resolvedClientName
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
                            clientName: resolvedClientName,
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
    endDate?: string;
    hasSpecificTime?: boolean;
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
                    clientName: p.client_name || p.clientName || undefined,
                    endDate: p.end_date || p.endDate || p.delivery_date || undefined
                });
            });
        } catch (e) {
            console.error("Auclaire Tasks Fetch Error:", e);
        }
    }

    // 2. Defcon (Shoots)
    if (turso) {
        try {
            const res = await turso.execute("SELECT * FROM shoots");
            res.rows.forEach(r => {
                let dateRaw = String(r.date || r.shoot_date || r.created_at || r.createdAt || '');
                const endDateRaw = r.end_date || r.endDate || undefined;
                
                // If there's an explicit time column separate from date, merge it
                const timeStr = String(r.time || r.start_time || r.shoot_time || '');
                if (timeStr && timeStr !== 'undefined' && !dateRaw.includes('T')) {
                    dateRaw = `${dateRaw.split(' ')[0]}T${timeStr}`;
                }

                tasks.push({
                    id: `def-${r.id || r.shoot_id || Math.random()}`,
                    appName: 'Defcon App',
                    title: String(r.title || r.name || 'Untitled Shoot'),
                    status: String(r.status || r.state || 'in_progress').toLowerCase().includes('done') ? 'done' : 'in_progress',
                    priority: 'high',
                    date: dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString(), // Fallback directly preventing NaN/invalid parsing later
                    endDate: endDateRaw ? new Date(String(endDateRaw)).toISOString() : undefined,
                    clientName: r.contact_name ? String(r.contact_name) : undefined,
                    budget: Number(r.budget || r.price || r.amount || 0),
                    hasSpecificTime: true // Shoots ALWAYS have a time constraint visually
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

export interface EmpireContact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    appName: string;
    status: 'vip' | 'active' | 'lead' | 'cold';
    lastActive: string;
    lifetimeValue: number;
    metrics: string; // Brief one-liner of what they did (e.g. "2 shoots", "1 ring")
}

export async function fetchOmniCRM(): Promise<EmpireContact[]> {
    const clients: EmpireContact[] = [];

    // 1. Auclaire (Clients & Users + Invoices for LTV)
    if (supabase) {
        try {
            const [usersRes, invRes] = await Promise.all([
                supabase.from('users').select('id, name, email, created_at'),
                supabase.from('invoices').select('user_id, amount_paid, status')
            ]);
            
            const ltvMap = new Map<string, number>();
            invRes.data?.forEach(inv => {
                if (inv.status === 'paid' && inv.user_id) {
                    ltvMap.set(inv.user_id, (ltvMap.get(inv.user_id) || 0) + Number(inv.amount_paid));
                }
            });

            usersRes.data?.forEach(u => {
                const ltv = ltvMap.get(u.id) || 0;
                clients.push({
                    id: `auc-${u.id}`,
                    name: u.name || 'Anonyme',
                    email: u.email || 'Pas d\'email',
                    appName: 'Auclaire',
                    status: ltv > 5000 ? 'vip' : (ltv > 0 ? 'active' : 'lead'),
                    lastActive: u.created_at || new Date().toISOString(),
                    lifetimeValue: ltv,
                    metrics: ltv > 0 ? 'Client Confirmé' : 'Prospect'
                });
            });
        } catch (e) {
            console.error("Auclaire CRM error", e);
        }
    }

    // 2. Defcon (Clients table)
    if (turso) {
        try {
            const res = await turso.execute("SELECT id, name, email, created_at FROM clients");
            const payments = await turso.execute("SELECT client_id, amount FROM payments WHERE status='paid' OR status='completed'");
            
            const ltvMap = new Map<string, number>();
            payments.rows.forEach(p => {
                const cid = String(p.client_id);
                ltvMap.set(cid, (ltvMap.get(cid) || 0) + Number(p.amount || 0));
            });

            res.rows.forEach(r => {
                const cid = String(r.id);
                const ltv = ltvMap.get(cid) || 0;
                clients.push({
                    id: `def-${cid}`,
                    name: String(r.name || 'Anonyme'),
                    email: String(r.email || 'Pas d\'email'),
                    appName: 'Defcon',
                    status: ltv > 10000 ? 'vip' : (ltv > 0 ? 'active' : 'lead'),
                    lastActive: String(r.created_at || new Date().toISOString()),
                    lifetimeValue: ltv,
                    metrics: ltv > 0 ? 'Client Confirmé' : 'Prospect'
                });
            });
        } catch (e) {
            console.error("Defcon CRM error", e);
        }
    }

    // 3. DRS (ClientProfile + Jobs)
    if (drsSupabase) {
        try {
            const [profiles, jobs] = await Promise.all([
                drsSupabase.from('ClientProfile').select('*'),
                drsSupabase.from('Job').select('clientId, totalPrice, status')
            ]);
            
            const ltvMap = new Map<string, number>();
            jobs.data?.forEach(j => {
                if (j.status === 'COMPLETED' && j.clientId) {
                    ltvMap.set(j.clientId, (ltvMap.get(j.clientId) || 0) + Number(j.totalPrice || 0));
                }
            });

            profiles.data?.forEach(c => {
                const ltv = ltvMap.get(c.id) || 0;
                clients.push({
                    id: `drs-${c.id}`,
                    name: `${c.firstName} ${c.lastName}`,
                    email: c.email || 'Pas d\'email',
                    phone: c.phone || undefined,
                    appName: 'DRS',
                    status: ltv > 2000 ? 'vip' : (ltv > 0 ? 'active' : 'lead'),
                    lastActive: c.updatedAt || c.createdAt || new Date().toISOString(),
                    lifetimeValue: ltv,
                    metrics: ltv > 0 ? 'Client Confirmé' : 'Prospect'
                });
            });
        } catch (e) {}
    }

    // 4. Viva Vegas (MongoDB clients)
    if (mongoClient) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('travel-agency');
            const vvClients = await db.collection('clients').find({}).toArray();
            
            vvClients.forEach(c => {
                clients.push({
                    id: `vv-${c._id}`,
                    name: c.name || [c.firstName, c.lastName].join(' ').trim() || 'Anonyme',
                    email: c.email || 'Pas d\'email',
                    phone: c.phone,
                    appName: 'Viva Vegas',
                    status: 'lead', // Hardcoded as lead unless we query quotes for LTV
                    lastActive: c.updatedAt || c.createdAt || new Date().toISOString(),
                    lifetimeValue: 0,
                    metrics: 'Prospect'
                });
            });
        } catch (e) {}
    }

    return clients.sort((a, b) => b.lifetimeValue - a.lifetimeValue); // VIP first
}
