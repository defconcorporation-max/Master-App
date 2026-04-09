import { NextResponse } from 'next/server';
import { fetchGlobalStats, fetchOmniTasks } from '@/lib/db-clients';

export async function GET() {
  try {
    const [stats, tasks] = await Promise.all([
      fetchGlobalStats(),
      fetchOmniTasks()
    ]);
    return NextResponse.json({ stats, tasks });
  } catch (error: any) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
