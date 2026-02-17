import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database/reconcila.db');

console.log('🔧 Adding reconciliation status columns...\n');

const db = new Database(dbPath);

try {
    // Check if columns exist
    const tableInfo = db.prepare("PRAGMA table_info(patients)").all();
    const hasReconciled = tableInfo.some(col => col.name === 'is_reconciled');
    const hasLastReconciled = tableInfo.some(col => col.name === 'last_reconciled_at');

    if (!hasReconciled) {
        console.log('Adding is_reconciled column...');
        db.exec(`ALTER TABLE patients ADD COLUMN is_reconciled INTEGER DEFAULT 0`);
    } else {
        console.log('✓ is_reconciled column already exists');
    }

    if (!hasLastReconciled) {
        console.log('Adding last_reconciled_at column...');
        db.exec(`ALTER TABLE patients ADD COLUMN last_reconciled_at DATETIME`);
    } else {
        console.log('✓ last_reconciled_at column already exists');
    }

    console.log('\n✅ Migration complete!');
    console.log('   Patients table now has reconciliation tracking\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} finally {
    db.close();
}