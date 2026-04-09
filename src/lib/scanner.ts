
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const ROOT_DIR = process.env.MASTER_ROOT_DIR || 'f:/Entreprises';

export interface Business {
    name: string;
    path: string;
    type: 'node-app' | 'static-site' | 'folder';
    status: 'active' | 'error' | 'unknown';
    icon?: string;
    error?: string;
    git?: {
        branch: string;
        uncommittedChanges: number;
    };
    dependencies?: {
        count: number;
        outdatedRisk: 'low' | 'medium' | 'high';
    };
}

export async function scanBusinesses(): Promise<Business[]> {
    console.log('Starting scan of:', ROOT_DIR);
    const businesses: Business[] = [];

    try {
        if (!fs.existsSync(ROOT_DIR)) {
            console.error(`Root directory does not exist: ${ROOT_DIR}`);
            return [];
        }

        const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
        console.log(`Found ${entries.length} entries in root.`);

        for (const entry of entries) {
            // Safe access to entry properties
            try {
                if (!entry.isDirectory()) continue;

                const name = entry.name;
                // Skip system folders and hidden folders
                if (name.startsWith('.') || name.startsWith('$') || name === 'System Volume Information') continue;

                const businessPath = path.join(ROOT_DIR, name);

                // Skip the master app itself and temp folder
                if (name === 'master app' || name === 'master-app-temp') continue;

                // Check for node app (package.json)
                const packageJsonPath = path.join(businessPath, 'package.json');
                const hasGit = fs.existsSync(path.join(businessPath, '.git'));
                
                let gitInfo = undefined;
                if (hasGit) {
                    try {
                        const { stdout: branchOut } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: businessPath });
                        const { stdout: statusOut } = await execAsync('git status -s', { cwd: businessPath });
                        
                        gitInfo = {
                            branch: branchOut.trim(),
                            uncommittedChanges: statusOut.trim() ? statusOut.trim().split('\n').filter(Boolean).length : 0
                        };
                    } catch (e) {
                         // Git might not be initialized properly or no commits
                    }
                }

                if (fs.existsSync(packageJsonPath)) {
                    console.log(`Found Node app: ${name}`);
                    
                    let depInfo = undefined;
                    try {
                        const content = fs.readFileSync(packageJsonPath, 'utf-8');
                        const pkg = JSON.parse(content);
                        const depsCount = Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length;
                        depInfo = {
                            count: depsCount,
                            outdatedRisk: (depsCount > 40 ? 'high' : depsCount > 20 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
                        };
                    } catch (e) {}

                    businesses.push({
                        name: name,
                        path: businessPath,
                        type: 'node-app',
                        status: 'active',
                        git: gitInfo,
                        dependencies: depInfo
                    });
                }
                // Allow specific non-node folders we know about
                else if (['RedRock Motion', 'Viva Vacances'].includes(name)) {
                    console.log(`Found Known Folder: ${name}`);
                    businesses.push({
                        name: name,
                        path: businessPath,
                        type: 'folder',
                        status: 'unknown',
                        git: gitInfo
                    });
                }
            } catch (innerError) {
                console.error(`Error processing entry ${entry.name}:`, innerError);
            }
        }
    } catch (error) {
        console.error('CRITICAL Error scanning directory:', error);
        // Return a dummy error entry so we can see it in UI
        return [{
            name: 'Scan Failed',
            path: ROOT_DIR,
            type: 'folder',
            status: 'error',
            error: String(error)
        }];
    }

    console.log(`Scan complete. Returning ${businesses.length} businesses.`);
    return businesses;
}
