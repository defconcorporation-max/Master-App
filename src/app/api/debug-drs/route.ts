import { NextResponse } from 'next/server';
import { drsPool } from '@/lib/db-clients';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: any = {
    env_detected: !!process.env.DRS_DATABASE_URL,
    env_starts_with: process.env.DRS_DATABASE_URL ? process.env.DRS_DATABASE_URL.substring(0, 15) : 'NONE',
    pool_exists: !!drsPool,
    timestamp: new Date().toISOString(),
  };

  if (!drsPool) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'DRS Pool not initialized. Check if DRS_DATABASE_URL is set in Vercel.',
      diagnostics 
    });
  }

  try {
    const start = Date.now();
    const res = await drsPool.query('SELECT current_database(), current_schema()');
    diagnostics.connection = 'SUCCESS';
    diagnostics.db_info = res.rows[0];
    diagnostics.latency = Date.now() - start;

    // Test tables
    try {
      const tableRes = await drsPool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
      diagnostics.tables = tableRes.rows.map(r => r.table_name);
    } catch (e: any) {
      diagnostics.table_error = e.message;
    }

  } catch (e: any) {
    diagnostics.connection = 'FAILED';
    diagnostics.error = e.message;
    diagnostics.error_code = e.code;
  }

  return NextResponse.json(diagnostics);
}
