import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database/reconcila.db');

console.log('🔧 Adding medication features (edit, duration, delete tracking)...\n');

const db = new Database(dbPath);

try {
    // Check existing columns
    const tableInfo = db.prepare("PRAGMA table_info(medications)").all();
    const hasArchivedAt = tableInfo.some(col => col.name === 'archived_at');
    const hasDeletedAt = tableInfo.some(col => col.name === 'deleted_at');
    const hasDuration = tableInfo.some(col => col.name === 'intended_duration');

    if (!hasArchivedAt) {
        console.log('Adding archived_at column...');
        db.exec(`ALTER TABLE medications ADD COLUMN archived_at DATETIME`);
    } else {
        console.log('✓ archived_at column already exists');
    }

    if (!hasDeletedAt) {
        console.log('Adding deleted_at column...');
        db.exec(`ALTER TABLE medications ADD COLUMN deleted_at DATETIME`);
    } else {
        console.log('✓ deleted_at column already exists');
    }

    if (!hasDuration) {
        console.log('Adding intended_duration column...');
        db.exec(`ALTER TABLE medications ADD COLUMN intended_duration TEXT`);
    } else {
        console.log('✓ intended_duration column already exists');
    }

    // Update existing archived medications to have archived_at timestamp
    console.log('Setting archived_at for existing archived medications...');
    db.exec(`
    UPDATE medications 
    SET archived_at = CURRENT_TIMESTAMP 
    WHERE status = 'archived' AND archived_at IS NULL
  `);

    console.log('\n✅ Migration complete!');
    console.log('   Added: archived_at, deleted_at, intended_duration columns\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} finally {
    db.close();
}