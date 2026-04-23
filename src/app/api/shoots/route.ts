import { NextResponse } from 'next/server';
import { turso } from '@/lib/db-clients';

export async function GET() {
    if (!turso) return NextResponse.json({ error: 'Defcon database not connected' }, { status: 503 });

    try {
        const res = await turso.execute(`
            SELECT s.*, c.name as client_name, c.company_name as client_company
            FROM shoots s
            LEFT JOIN clients c ON s.client_id = c.id
            ORDER BY s.shoot_date DESC
        `);
        return NextResponse.json({ shoots: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!turso) return NextResponse.json({ error: 'Defcon database not connected' }, { status: 503 });

    try {
        const body = await request.json();
        const { clientId, projectId, title, date, startTime, endTime, color, dueDate } = body;

        if (!title || !date) {
            return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
        }

        // If no clientId provided, get the first client as default
        let finalClientId = clientId;
        if (!finalClientId) {
            const clientRes = await turso.execute('SELECT id FROM clients LIMIT 1');
            finalClientId = clientRes.rows[0]?.id || null;
        }

        const result = await turso.execute({
            sql: 'INSERT INTO shoots (client_id, project_id, title, shoot_date, start_time, end_time, color, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            args: [finalClientId, projectId || null, title, date, startTime || null, endTime || null, color || 'indigo', dueDate || null]
        });

        return NextResponse.json({ 
            success: true, 
            id: Number(result.lastInsertRowid),
            message: `Shoot "${title}" created for ${date}`
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
