import { spawn, ChildProcess } from 'child_process';

interface ProcessInfo {
    id: string;
    name: string;
    status: 'running' | 'stopped' | 'failed';
    process?: ChildProcess;
    logs: string[];
}

// In-memory store for dev purposes since this is a local dashboard
const activeProcesses: Record<string, ProcessInfo> = {};

export const ProcessManager = {
    start: (id: string, name: string, cwd: string, command: string, args: string[]) => {
        if (activeProcesses[id]?.status === 'running') {
            return { success: false, error: 'Command already running' };
        }

        const child = spawn(command, args, { cwd, shell: true });
        
        activeProcesses[id] = {
            id,
            name,
            status: 'running',
            process: child,
            logs: [`> ${command} ${args.join(' ')}\n`]
        };

        const logStream = (data: Buffer) => {
            const lines = data.toString().split('\n');
            activeProcesses[id].logs.push(...lines);
            // Keep memory bounded to last 500 lines
            if (activeProcesses[id].logs.length > 500) {
                activeProcesses[id].logs = activeProcesses[id].logs.slice(-500);
            }
        };

        child.stdout?.on('data', logStream);
        child.stderr?.on('data', logStream);

        child.on('close', (code) => {
            if (activeProcesses[id]) {
                activeProcesses[id].status = code === 0 ? 'stopped' : 'failed';
                activeProcesses[id].logs.push(`\n[Process exited with code ${code}]`);
            }
        });

        return { success: true, id };
    },

    stop: (id: string) => {
        const proc = activeProcesses[id];
        if (proc && proc.status === 'running' && proc.process) {
            proc.process.kill();
            proc.status = 'stopped';
            proc.logs.push('\n[Process terminated by Master App]');
            return true;
        }
        return false;
    },

    getLogs: (id: string) => {
        return activeProcesses[id]?.logs || [];
    },

    getStatus: (id: string) => {
        return activeProcesses[id]?.status || 'stopped';
    },
    
    getAll: () => {
        return Object.entries(activeProcesses).map(([id, data]) => ({
            id,
            name: data.name,
            status: data.status
        }));
    }
};
