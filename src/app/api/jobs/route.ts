import { NextResponse } from 'next/server';
import { drsPool } from '@/lib/db-clients';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
    if (!drsPool) return NextResponse.json({ error: 'DRS database not connected' }, { status: 503 });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await drsPool.query('DELETE FROM "Job" WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
