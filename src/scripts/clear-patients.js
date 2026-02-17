import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database/reconcila.db');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('⚠️  WARNING: This will delete ALL patient data!\n');

rl.question('Are you sure you want to delete all patients? (type "yes" to confirm): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
        const db = new Database(dbPath);

        try {
            console.log('\n🗑️  Deleting all patient data...\n');

            // Get counts before deletion
            const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get();
            const medCount = db.prepare('SELECT COUNT(*) as count FROM medications').get();

            // Delete all medications first (cascade should handle this, but just in case)
            db.prepare('DELETE FROM medications').run();
            console.log(`   Deleted ${medCount.count} medications`);

            // Delete all patients
            db.prepare('DELETE FROM patients').run();
            console.log(`   Deleted ${patientCount.count} patients`);

            console.log('\n✅ All patient data has been cleared!\n');
            console.log('   Doctors and medication catalog remain intact.\n');

        } catch (error) {
            console.error('❌ Error:', error.message);
        } finally {
            db.close();
        }
    } else {
        console.log('\n❌ Cancelled. No data was deleted.\n');
    }

    rl.close();
});