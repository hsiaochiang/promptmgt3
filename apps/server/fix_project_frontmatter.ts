
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

// Known slugs
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
    const rootPath = 'd:\\program\\promptmgt3\\apps\\server\\data\\projects';

    console.log('--- Fixing Project Frontmatter (name -> title) ---');
    for (const slug of PROJECT_SLUGS) {
        const filePath = path.join(rootPath, slug, 'project.md');
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const { data, content: body } = matter(content);

            // Fix: Ensure title exists
            let newTitle = data.title;
            if (!newTitle && data.name) {
                newTitle = data.name;
            }

            if (!newTitle) {
                console.error(`Project ${slug} has no title or name!`);
                continue;
            }

            if (data.name) {
                delete data.name;
            }

            const newData = {
                ...data,
                title: newTitle,
                // Ensure other required fields per schema:
                // id, slug, createdAt, updatedAt
                // updated via previous scripts
            };

            const newContent = matter.stringify(body, newData);
            await fs.writeFile(filePath, newContent, 'utf-8');
            console.log(`Fixed ${slug}: Added title '${newTitle}'`);
        } catch (e) {
            console.error(`Failed to fix ${slug}:`, e);
        }
    }
}

main().catch(console.error);
