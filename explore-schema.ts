import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.AUCLAIRE_SUPABASE_URL || '';
const supabaseKey = process.env.AUCLAIRE_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log("--- AUCLAIRE SCHEMA EXPLORER ---");
    // We can't easily list tables via supabase-js without RPC, 
    // but we can try common ones.
    const tables = ['clients', 'invoices', 'expenses', 'projects', 'tasks', 'project_tasks', 'jobs', 'users'];
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('id').limit(1);
        if (!error) console.log(`[FOUND] Table: ${t}`);
        else console.log(`[MISSING/ACCESS] Table: ${t} (${error.code})`);
    }
}

listTables();
