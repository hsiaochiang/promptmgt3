
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

async function main() {
    const rootPath = 'd:\\program\\promptmgt3\\apps\\server\\data\\projects';

    // Recursively find project.md files or just scan known folders
    const dirs = await fs.readdir(rootPath, { withFileTypes: true });

    for (const dir of dirs) {
        if (!dir.isDirectory()) continue;

        const filePath = path.join(rootPath, dir.name, 'project.md');
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const { data, content: body } = matter(content);

            if (data.status === 'ACTIVE') {
                console.log(`Fixing status for ${dir.name}...`);
                const newData = { ...data, status: 'in_progress' };
                const newContent = matter.stringify(body, newData);
                await fs.writeFile(filePath, newContent, 'utf-8');
            }
        } catch (e) {
            // ignore missing
        }
    }
}

main().catch(console.error);
