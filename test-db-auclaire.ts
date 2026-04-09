import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.AUCLAIRE_SUPABASE_URL || '';
const supabaseKey = process.env.AUCLAIRE_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuclaire() {
    console.log("--- AUCLAIRE DIAGNOSTICS ---");
    const { data: clients } = await supabase.from('clients').select('id');
    console.log(`Clients count (raw data):`, clients?.length);

    const { data: invoices } = await supabase.from('invoices').select('*');
    console.log(`Invoices count:`, invoices?.length);
    if (invoices?.length) console.log(invoices);

    const { data: projects } = await supabase.from('projects').select('*');
    console.log(`Projects count:`, projects?.length);
}

checkAuclaire();
