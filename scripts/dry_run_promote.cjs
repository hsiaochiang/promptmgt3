const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const PROJECTS_DIR = 'apps/server/data/projects';
const INBOX_DIR = 'apps/server/data/inbox';

// 1. Build Project Index
const projectMap = new Map(); // id -> slug
if (fs.existsSync(PROJECTS_DIR)) {
    const dirs = fs.readdirSync(PROJECTS_DIR);
    for (const dir of dirs) {
        const mdPath = path.join(PROJECTS_DIR, dir, 'project.md');
        if (fs.existsSync(mdPath)) {
            try {
                const content = fs.readFileSync(mdPath, 'utf8');
                const parsed = matter(content);
                if (parsed.data.id) {
                    projectMap.set(parsed.data.id, dir);
                }
            } catch (e) {
                console.error('Error reading project:', dir, e);
            }
        }
    }
}

console.log('Project Index Built:', projectMap.size, 'projects found.');

// 2. Scan Inbox
if (fs.existsSync(INBOX_DIR)) {
    const files = fs.readdirSync(INBOX_DIR).filter(f => f.endsWith('.md'));
    let ready = 0;
    let orphan = 0;
    let error = 0;

    console.log('\n--- Batch Promotion Plan ---');

    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(INBOX_DIR, file), 'utf8');
            const parsed = matter(content);
            const projectId = parsed.data.project;
            const title = (parsed.data.title || 'Untitled').replace(/\n/g, ' ');

            if (projectId && projectMap.has(projectId)) {
                console.log(`[READY] "${title.substring(0, 40)}" -> ${projectMap.get(projectId)}`);
                ready++;
            } else if (projectId) {
                console.log(`[ORPHAN] "${title.substring(0, 40)}" -> Unknown ID: ${projectId}`);
                orphan++;
            } else {
                console.log(`[NO_ID]  "${title.substring(0, 40)}" -> No Project ID`);
                orphan++;
            }
        } catch (e) {
            console.log(`[ERROR]  ${file}: ${e.message}`);
            error++;
        }
    }

    console.log('\n--- Summary ---');
    console.log('Total Inbox Items:', files.length);
    console.log('Ready to Promote:', ready);
    console.log('Orphans (No/Bad Project):', orphan);
    console.log('Errors:', error);
} else {
    console.log('Inbox dir not found');
}
