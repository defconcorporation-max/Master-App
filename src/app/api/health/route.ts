import { NextResponse } from 'next/server';
import path from 'path';
import { supabase, turso, mongoClient, drsSupabase } from '@/lib/db-clients';

const MASTER_ROOT_DIR = process.env.MASTER_ROOT_DIR || 'f:/Entreprises';
const getDrsDbPath = () => process.env.DRS_DB_PATH || path.join(MASTER_ROOT_DIR, 'DRS', 'detailing software', 'prisma', 'dev.db');

type Status = 'ok' | 'error' | 'off';

interface HealthItem {
  name: string;
  status: Status;
  latencyMs?: number;
  error?: string;
}

export async function GET() {
  const results: Record<string, HealthItem> = {};
  const start = Date.now();

  // Auclaire (Supabase)
  if (supabase) {
    const t0 = Date.now();
    try {
      const { error } = await supabase.from('clients').select('id').limit(1).maybeSingle();
      results.auclaire = { name: 'Auclaire', status: error && error.code !== '42P01' ? 'error' : 'ok', latencyMs: Date.now() - t0, error: error?.message };
    } catch (e: unknown) {
      results.auclaire = { name: 'Auclaire', status: 'error', latencyMs: Date.now() - t0, error: String(e) };
    }
  } else {
    results.auclaire = { name: 'Auclaire', status: 'off' };
  }

  // Defcon (Turso)
  if (turso) {
    const t0 = Date.now();
    try {
      await turso.execute('SELECT 1');
      results.defcon = { name: 'Defcon', status: 'ok', latencyMs: Date.now() - t0 };
    } catch (e: unknown) {
      results.defcon = { name: 'Defcon', status: 'error', latencyMs: Date.now() - t0, error: String(e) };
    }
  } else {
    results.defcon = { name: 'Defcon', status: 'off' };
  }

  // Antigravity (MongoDB)
  if (mongoClient) {
    const t0 = Date.now();
    try {
      await mongoClient.connect();
      await mongoClient.db('travel-agency').command({ ping: 1 });
      results.antigravity = { name: 'Viva Vegas', status: 'ok', latencyMs: Date.now() - t0 };
    } catch (e: unknown) {
      results.antigravity = { name: 'Viva Vegas', status: 'error', latencyMs: Date.now() - t0, error: String(e) };
    }
  } else {
    results.antigravity = { name: 'Viva Vegas', status: 'off' };
  }

  // DRS (Supabase)
  if (drsSupabase) {
    const t0 = Date.now();
    try {
      const { error } = await drsSupabase.from('ClientProfile').select('id').limit(1).maybeSingle();
      results.drs = { name: 'DRS', status: error && error.code !== '42P01' ? 'error' : 'ok', latencyMs: Date.now() - t0, error: error?.message };
    } catch (e: unknown) {
      results.drs = { name: 'DRS', status: 'error', latencyMs: Date.now() - t0, error: String(e) };
    }
  } else {
    results.drs = { name: 'DRS', status: 'off' };
  }

  const ok = Object.values(results).every((r) => r.status === 'ok');
  return NextResponse.json({
    status: ok ? 'healthy' : 'degraded',
    totalMs: Date.now() - start,
    apps: results,
  });
}
