const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const PROJECTS_DIR = 'apps/server/data/projects';

// Walk through all processed prompts and fix schema issues
function fixPrompts() {
    if (!fs.existsSync(PROJECTS_DIR)) return;

    const projectDirs = fs.readdirSync(PROJECTS_DIR);
    let fixedCount = 0;

    for (const dir of projectDirs) {
        const promptsDir = path.join(PROJECTS_DIR, dir, 'prompts');
        if (!fs.existsSync(promptsDir)) continue;

        const files = fs.readdirSync(promptsDir).filter(f => f.endsWith('.md'));

        for (const file of files) {
            const filePath = path.join(promptsDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const parsed = matter(content);
                let changed = false;

                // Fix 1: Missing createdAt
                if (!parsed.data.createdAt) {
                    parsed.data.createdAt = parsed.data.importedAt || parsed.data.updatedAt || new Date().toISOString();
                    changed = true;
                }

                // Write back if changed
                if (changed) {
                    const newContent = matter.stringify(parsed.content, parsed.data);
                    fs.writeFileSync(filePath, newContent);
                    console.log(`[FIXED] ${dir}/${file} - Added createdAt`);
                    fixedCount++;
                }
            } catch (e) {
                console.error(`[ERROR] Processing ${filePath}:`, e.message);
            }
        }
    }
    console.log(`Total files fixed: ${fixedCount}`);
}

fixPrompts();
