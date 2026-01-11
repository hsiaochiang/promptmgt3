
import { scanWorkspace } from './src/indexing/index.js';
import path from 'path';

async function main() {
    const rootPath = path.join(process.cwd(), 'data');
    console.log(`Scanning workspace at: ${rootPath}`);

    const result = await scanWorkspace(rootPath);

    console.log(`Found ${result.projects.length} projects.`);
    result.projects.forEach(p => console.log(` - ${p.id} (${p.title})`));

    if (result.errors.length > 0) {
        console.log('\nErrors found:');
        result.errors.forEach(e => {
            console.log(`[${e.path}] ${e.error}`);
        });
    }
}

main().catch(console.error);
