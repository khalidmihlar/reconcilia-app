import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/reconcila.db');

console.log('🔧 Adding archive reason columns...\n');

const db = new Database(dbPath);

try {
    // Check existing columns
    const tableInfo = db.prepare("PRAGMA table_info(medications)").all();
    const hasArchiveReason = tableInfo.some(col => col.name === 'archive_reason');
    const hasArchiveComments = tableInfo.some(col => col.name === 'archive_comments');

    if (!hasArchiveReason) {
        console.log('Adding archive_reason column...');
        db.exec(`ALTER TABLE medications ADD COLUMN archive_reason TEXT`);
    } else {
        console.log('✓ archive_reason column already exists');
    }

    if (!hasArchiveComments) {
        console.log('Adding archive_comments column...');
        db.exec(`ALTER TABLE medications ADD COLUMN archive_comments TEXT`);
    } else {
        console.log('✓ archive_comments column already exists');
    }

    console.log('\n✅ Migration complete!\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} finally {
    db.close();
}