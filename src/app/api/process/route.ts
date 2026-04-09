import path from 'path';
import { NextResponse } from 'next/server';
import { ProcessManager } from '@/lib/process-manager';

const MASTER_ROOT_DIR = process.env.MASTER_ROOT_DIR || 'f:/Entreprises';
const MASTER_APP_CWD = path.join(MASTER_ROOT_DIR, 'master app');

export async function POST(req: Request) {
    const body = await req.json();
    let { action, id, name, cwd, command } = body;
    if (action === 'start' && (cwd === 'master-app' || !cwd)) cwd = MASTER_APP_CWD;

    if (action === 'start') {
        if (!id || !cwd || !command) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        const [cmd, ...args] = command.split(' ');
        const result = ProcessManager.start(id, name || id, cwd, cmd, args);
        return NextResponse.json(result);
    }
    
    if (action === 'stop') {
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const success = ProcessManager.stop(id);
        return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
        return NextResponse.json({ processes: ProcessManager.getAll() });
    }

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    return NextResponse.json({ 
        status: ProcessManager.getStatus(id),
        logs: ProcessManager.getLogs(id) 
    });
}
