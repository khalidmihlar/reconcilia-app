import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database/reconcila.db');

console.log('🔧 Adding reconciliation checklist columns...\n');

const db = new Database(dbPath);

try {
    // Check if columns exist
    const tableInfo = db.prepare("PRAGMA table_info(patients)").all();
    const hasOtcs = tableInfo.some(col => col.name === 'asked_otcs_topicals_injectables');
    const hasAllergies = tableInfo.some(col => col.name === 'asked_allergies');
    const hasMedicationAccess = tableInfo.some(col => col.name === 'asked_medication_access');

    if (!hasOtcs) {
        console.log('Adding asked_otcs_topicals_injectables column...');
        db.exec(`ALTER TABLE patients ADD COLUMN asked_otcs_topicals_injectables INTEGER DEFAULT 0`);
    } else {
        console.log('✓ asked_otcs_topicals_injectables column already exists');
    }

    if (!hasAllergies) {
        console.log('Adding asked_allergies column...');
        db.exec(`ALTER TABLE patients ADD COLUMN asked_allergies INTEGER DEFAULT 0`);
    } else {
        console.log('✓ asked_allergies column already exists');
    }

    if (!hasMedicationAccess) {
        console.log('Adding asked_medication_access column...');
        db.exec(`ALTER TABLE patients ADD COLUMN asked_medication_access INTEGER DEFAULT 0`);
    } else {
        console.log('✓ asked_medication_access column already exists');
    }

    console.log('\n✅ Migration complete!');
    console.log('   Patients table now has reconciliation checklist columns\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} finally {
    db.close();
}