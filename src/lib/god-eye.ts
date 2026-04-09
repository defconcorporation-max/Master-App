import { createClient } from '@supabase/supabase-js';

// The Master App God-Eye needs Service Role Keys to bypass RLS for administrative search across multiple apps
const apps = {
    auclaire: {
        url: process.env.AUCLAIRE_SUPABASE_URL || 'https://mock-auclaire.supabase.co',
        key: process.env.AUCLAIRE_SUPABASE_SERVICE_KEY || 'mock-key'
    },
    defcon: {
        url: process.env.DEFCON_SUPABASE_URL || 'https://mock-defcon.supabase.co',
        key: process.env.DEFCON_SUPABASE_SERVICE_KEY || 'mock-key'
    },
    antigravity: {
        url: process.env.ANTIGRAVITY_SUPABASE_URL || 'https://mock-antigravity.supabase.co',
        key: process.env.ANTIGRAVITY_SUPABASE_SERVICE_KEY || 'mock-key'
    }
};

const getClients = () => {
    return Object.entries(apps).map(([appName, config]) => {
        return {
            name: appName.charAt(0).toUpperCase() + appName.slice(1),
            client: createClient(config.url, config.key)
        };
    });
};

export interface OmniSearchResult {
    id: string;
    appName: string;
    type: 'client' | 'project' | 'job' | 'invoice';
    title: string;
    subtitle: string;
    url?: string;
}

export async function performGodEyeSearch(query: string): Promise<OmniSearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const clients = getClients();
    
    // In a production scenario with live schemas, we would map over `clients` and run parallel 
    // Supabase queries (e.g. `client.from('users').select('*').ilike('email', '%'+query+'%')`)
    
    // Simulating God-Tier cross-database resolution for MVP display until keys are injected:
    return new Promise((resolve) => {
        setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            const mockResults: OmniSearchResult[] = [];
            
            // Omni-CRM scenario: Search one email, find data across 3 completely different apps
            if ("john".includes(lowerQuery) || "doe".includes(lowerQuery) || "john@example.com".includes(lowerQuery)) {
                mockResults.push(
                    { id: '1', appName: 'Auclaire', type: 'client', title: 'John Doe', subtitle: 'john@example.com (LTV: $5,200)' },
                    { id: '2', appName: 'Defcon', type: 'invoice', title: 'INV-2026-089 (John Doe)', subtitle: 'Status: Overdue · $450.00' },
                    { id: '3', appName: 'Antigravity', type: 'project', title: 'JD Consulting Site', subtitle: 'Next.js App · Last active 12h ago' }
                );
            }
            
            if ("error".includes(lowerQuery) || "bug".includes(lowerQuery)) {
                mockResults.push(
                    { id: '4', appName: 'Antigravity', type: 'job', title: 'Sentry Fatal Exception', subtitle: 'TypeError: Cannot read properties of undefined' },
                    { id: '5', appName: 'Auclaire', type: 'client', title: 'Urgent Support Ticket', subtitle: 'Payment gateway failing on checkout' }
                );
            }
            
            if (mockResults.length === 0) {
                 mockResults.push(
                     { id: `dyn-${Date.now()}`, appName: 'Master App Engine', type: 'client', title: `Cross-DB match for '${query}'`, subtitle: 'Matched via Omni-Search index across 3 clusters' }
                 );
            }
            
            resolve(mockResults);
        }, 400); // 400ms delay to simulate global cross-DB fetching
    });
}
