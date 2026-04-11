import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient as createTursoClient } from '@libsql/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

async function test() {
  console.log('Testing Defcon...');
  const tursoUrl = process.env.DEFCON_TURSO_URL;
  if (tursoUrl) {
    const turso = createTursoClient({ url: process.env.DEFCON_TURSO_URL!, authToken: process.env.DEFCON_TURSO_TOKEN! });
    const shoots = await turso.execute("SELECT * FROM shoots LIMIT 3");
    console.log("SHOOTS COLUMNS:", shoots.columns);
    console.log("SHOOTS DATA:", shoots.rows);
  }

  console.log('Testing DRS...');
  const drsUrl = process.env.DRS_SUPABASE_URL;
  if(drsUrl) {
    const supabase = createSupabaseClient(process.env.DRS_SUPABASE_URL!, process.env.DRS_SUPABASE_KEY!);
    const { data: jobs } = await supabase.from('Job').select('*').limit(3);
    if(jobs && jobs.length > 0) {
        console.log("DRS JOB KEYS:", Object.keys(jobs[0]));
        console.log("DRS JOB DATA:", jobs.slice(0,2));
    } else {
        console.log("NO DRS JOBS");
    }
  }

  console.log('Testing Auclaire...');
  const aucUrl = process.env.AUCLAIRE_SUPABASE_URL;
  if (aucUrl) {
    const auclaire = createSupabaseClient(process.env.AUCLAIRE_SUPABASE_URL!, process.env.AUCLAIRE_SUPABASE_KEY!);
    const { data: proj } = await auclaire.from('projects').select('*').limit(3);
    if(proj && proj.length > 0) {
        console.log("AUCLAIRE PROJ KEYS:", Object.keys(proj[0]));
        console.log("AUCLAIRE PROJ DATA:", proj.slice(0,2));
    }
  }
}
test().catch(console.error);
