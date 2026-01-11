
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';

// Known slugs from my previous script
const PROJECT_SLUGS = [
    'prompt-mgt-system',
    'speckit-platform',
    'wos-frontend',
    'fin-inquiry-bot',
    'cloud-orange-rfp',
    'gov-rfp-helper',
    'file-search-automation',
    'hackmd-automation',
    'code-best-practices',
    'gen-ai-guidelines',
    'biz-operations',
    'personal-notes'
];

async function main() {
    const rootPath = 'd:\\program\\promptmgt3\\apps\\server\\data';
    const projectsDir = path.join(rootPath, 'projects');
    const inboxDir = path.join(rootPath, 'inbox');

    const slugToUuid = new Map<string, string>();

    // 1. Fix Projects (Generate UUIDs)
    console.log('--- Fixing Projects ---');
    for (const slug of PROJECT_SLUGS) {
        const projFile = path.join(projectsDir, slug, 'project.md');
        try {
            const content = await fs.readFile(projFile, 'utf-8');
            const { data, content: body } = matter(content);

            // Generate new UUID
            const newId = uuidv4();
            slugToUuid.set(slug, newId);

            const newData = {
                ...data,
                id: newId,
                slug: slug, // Ensure slug is set
                status: 'in_progress' // Ensure status is valid
            };

            const newContent = matter.stringify(body, newData);
            await fs.writeFile(projFile, newContent, 'utf-8');
            console.log(`Updated Project ${slug}: ${newId}`);
        } catch (e) {
            console.error(`Failed to fix project ${slug}:`, e);
        }
    }

    // 2. Fix Inbox Items (Link to UUIDs)
    console.log('\n--- Relinking Inbox Items ---');
    const inboxFiles = await fs.readdir(inboxDir);
    for (const file of inboxFiles) {
        if (!file.endsWith('.md')) continue;

        const filePath = path.join(inboxDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: body } = matter(content);

        // Check if project field matches a known slug
        if (data.project && slugToUuid.has(data.project)) {
            const uuid = slugToUuid.get(data.project);
            const newData = {
                ...data,
                project: uuid
            };
            const newContent = matter.stringify(body, newData);
            await fs.writeFile(filePath, newContent, 'utf-8');
            console.log(`Relinked ${file}: ${data.project} -> ${uuid}`);
        }
    }
}

main().catch(console.error);
