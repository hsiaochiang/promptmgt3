
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inboxDir = path.join(__dirname, '../data/inbox');

function formatDate(dateInput) {
    if (!dateInput) return dateInput; // Return original if invalid
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput;

    const formatted = date.toLocaleString('en-US', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return formatted.replace(/,/g, '');
}

async function fixDates() {
    const files = fs.readdirSync(inboxDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} markdown files.`);

    let updatedCount = 0;

    for (const file of files) {
        const filePath = path.join(inboxDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Regex to find "Created: <date>" or "**Created**: <date>"
        // Captures: 1: prefix (**Created**: or Created:), 2: date string
        const regex = /(\*\*Created\*\*:|Created:)\s*([0-9-T:.]+Z?)/gi;

        let changed = false;
        const newContent = content.replace(regex, (match, prefix, dateStr) => {
            const newDate = formatDate(dateStr);
            if (newDate !== dateStr) {
                changed = true;
                return `${prefix} ${newDate}`;
            }
            return match;
        });

        if (changed) {
            fs.writeFileSync(filePath, newContent);
            updatedCount++;
            // console.log(`Updated: ${file}`);
        }
    }

    console.log(`Date fix complete. Updated ${updatedCount} files.`);
}

fixDates();
