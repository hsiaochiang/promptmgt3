const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const PROJECTS_DIR = 'apps/server/data/projects';
const INBOX_DIR = 'apps/server/data/inbox';

// Fix regex logic from inbox.ts
function generateSlug(title, id) {
    return title.trim().toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '') || id;
}

// Status mapping
const statusMap = {
    'ACTIVE': 'draft',
    'PENDING': 'needs_review',
    'COMPLETED': 'ready',
    'ARCHIVED': 'deprecated',
};

// 1. Build Project Index
const projectMap = new Map(); // id -> {slug, path}
if (fs.existsSync(PROJECTS_DIR)) {
    const dirs = fs.readdirSync(PROJECTS_DIR);
    for (const dir of dirs) {
        const mdPath = path.join(PROJECTS_DIR, dir, 'project.md');
        if (fs.existsSync(mdPath)) {
            const content = fs.readFileSync(mdPath, 'utf8');
            const parsed = matter(content);
            if (parsed.data.id) {
                projectMap.set(parsed.data.id, { slug: dir, path: path.join(PROJECTS_DIR, dir) });
            }
        }
    }
}

console.log(`Starting Batch Promotion. Project Count: ${projectMap.size}`);

// 2. Process Inbox
if (fs.existsSync(INBOX_DIR)) {
    const files = fs.readdirSync(INBOX_DIR).filter(f => f.endsWith('.md'));

    for (const file of files) {
        try {
            const sourcePath = path.join(INBOX_DIR, file);
            const content = fs.readFileSync(sourcePath, 'utf8');
            const parsed = matter(content);
            const projectId = parsed.data.project;
            const title = parsed.data.title || 'Untitled';

            if (projectId && projectMap.has(projectId)) {
                const project = projectMap.get(projectId);
                const slug = generateSlug(title, parsed.data.id);

                // Prepare new frontmatter
                const newFrontmatter = { ...parsed.data };
                newFrontmatter.slug = slug;

                // Fix status
                const originalStatus = newFrontmatter.status;
                newFrontmatter.status = statusMap[originalStatus] || 'draft';

                // Remove inbox-specific fields that are not in prompt schema (optional, but good for hygiene)
                delete newFrontmatter.cleanedState;
                delete newFrontmatter.project; // Prompt schema uses projectId
                newFrontmatter.projectId = projectId;
                newFrontmatter.updatedAt = new Date().toISOString();

                // Write new file
                const targetDir = path.join(project.path, 'prompts');
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                const targetPath = path.join(targetDir, `${slug}.md`);

                const newContent = matter.stringify(parsed.content, newFrontmatter);
                fs.writeFileSync(targetPath, newContent);

                // Verify and delete source
                if (fs.existsSync(targetPath)) {
                    fs.unlinkSync(sourcePath);
                    console.log(`[PROMOTED] ${file} -> ${project.slug}/${slug}.md`);
                } else {
                    console.error(`[FAIL] Verification failed for ${targetPath}`);
                }

            } else {
                console.log(`[SKIP] ${file} - Orphan or No ID`);
            }
        } catch (e) {
            console.error(`[ERROR] Processing ${file}:`, e);
        }
    }
    console.log('Batch promotion complete.');
}
