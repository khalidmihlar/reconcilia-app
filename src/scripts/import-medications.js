import Database from 'better-sqlite3';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use database in project root /database folder
const dbPath = path.join(__dirname, '../../database/reconcila.db');
const excelPath = path.join(__dirname, '../../medication.xlsx');

console.log('📊 Importing medications from Excel...\n');
console.log('Database path:', dbPath);
console.log('Excel path:', excelPath);
console.log('');

// Check if Excel file exists
if (!fs.existsSync(excelPath)) {
    console.error('❌ Error: medication.xlsx not found at:', excelPath);
    console.log('   Please place medication.xlsx in the project root directory');
    process.exit(1);
}

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    console.log('📁 Creating database directory...');
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

try {
    // Create medication_catalog table
    console.log('📋 Creating medication_catalog table...');
    db.exec(`
    CREATE TABLE IF NOT EXISTS medication_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      form TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Create index for faster searches
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_medication_name ON medication_catalog(name);
  `);

    // Read Excel file
    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get data without headers first
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`   Found ${rawData.length} rows in Excel\n`);

    // Skip first row (header) and convert to objects
    const medications = rawData.slice(1)
        .filter(row => row[0] && row[1]) // Make sure both columns have data
        .map(row => ({
            Medication: row[0],
            Form: row[1]
        }));

    console.log(`   ${medications.length} valid medication entries\n`);

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    db.exec('DELETE FROM medication_catalog');

    // Insert medications
    const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO medication_catalog (name, form)
    VALUES (?, ?)
  `);

    const insertMany = db.transaction((meds) => {
        for (const med of meds) {
            insertStmt.run(
                med.Medication.toString().trim(),
                med.Form.toString().trim()
            );
        }
    });

    console.log('💾 Importing medications...');
    insertMany(medications);

    // Get count
    const count = db.prepare('SELECT COUNT(*) as count FROM medication_catalog').get();

    console.log(`\n✅ Import complete!`);
    console.log(`   ${count.count} medications imported successfully`);
    console.log(`   Database location: ${dbPath}\n`);

    // Show sample
    console.log('📋 Sample medications:');
    const sample = db.prepare('SELECT * FROM medication_catalog LIMIT 5').all();
    sample.forEach(med => {
        console.log(`   - ${med.name} (${med.form})`);
    });
    console.log('');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
} finally {
    db.close();
}