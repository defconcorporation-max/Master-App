import { NextResponse } from 'next/server';
import { turso } from '@/lib/db-clients';

export async function GET() {
    if (!turso) return NextResponse.json({ error: 'Defcon database not connected' }, { status: 503 });

    try {
        const res = await turso.execute('SELECT id, name, company_name FROM clients ORDER BY company_name ASC');
        return NextResponse.json({ clients: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
