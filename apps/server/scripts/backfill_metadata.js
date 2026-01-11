
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inboxDir = path.join(__dirname, '../data/inbox');

// Default Metadata
const DEFAULT_STATUS = 'ACTIVE';
const DEFAULT_CATEGORY = '#Cat/PROMPT_DRAFT';
const DEFAULT_TAGS = ['#Stage/IDEA'];

async function backfill() {
    const files = fs.readdirSync(inboxDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} markdown files.`);

    let updatedCount = 0;

    for (const file of files) {
        const filePath = path.join(inboxDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = matter(content);

        let changed = false;
        const data = parsed.data;

        // Default Title if empty
        if (!data.title || data.title === 'Untitled') {
            const text = parsed.content.trim().slice(0, 50).replace(/\n/g, ' ');
            data.title = text || 'Untitled Item';
            changed = true;
        }

        // Default Status
        if (!data.status || data.status === '') {
            data.status = DEFAULT_STATUS;
            changed = true;
        }

        // Default Category
        if (!data.category || data.category === '') {
            data.category = DEFAULT_CATEGORY;
            changed = true;
        }

        // Default Tags
        if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
            data.tags = DEFAULT_TAGS;
            changed = true;
        }

        if (changed) {
            const newContent = matter.stringify(parsed.content, data);
            fs.writeFileSync(filePath, newContent);
            updatedCount++;
            // console.log(`Updated: ${file}`);
        }
    }

    console.log(`Backfill complete. Updated ${updatedCount} files.`);
}

backfill();
