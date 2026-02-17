#!/usr/bin/env node

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database file in the project root
const dbPath = path.join(__dirname, '../database/data/reconcila.db');

console.log('🚀 Setting up database...\n');
console.log('📁 Database location:', dbPath, '\n');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

try {
  // Create Doctors table
  console.log('📋 Creating doctors table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Patients table
  console.log('📋 Creating patients table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      date_of_birth TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    )
  `);

  // Create Medications table
  console.log('📋 Creating medications table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      strength TEXT,
      form TEXT,
      dose TEXT,
      frequency TEXT,
      prescribed TEXT,
      comments TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  console.log('🔍 Creating indexes...');
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
    CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
  `);

  // Insert test doctor
  console.log('👤 Creating test doctor account...');
  const insertDoctor = db.prepare(`
    INSERT OR IGNORE INTO doctors (email, password_hash, first_name, last_name)
    VALUES (?, ?, ?, ?)
  `);

  insertDoctor.run('test@example.com', 'password123', 'Test', 'Doctor');

  // Get stats
  const doctorCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get();
  const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get();
  const medicationCount = db.prepare('SELECT COUNT(*) as count FROM medications').get();

  console.log('\n✅ Database setup complete!\n');
  console.log('📊 Current Stats:');
  console.log(`   - Doctors: ${doctorCount.count}`);
  console.log(`   - Patients: ${patientCount.count}`);
  console.log(`   - Medications: ${medicationCount.count}`);
  console.log('\n🔑 Test Login Credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
  console.log('\n💡 You can now start your app with: npm run dev\n');

} catch (error) {
  console.error('❌ Error setting up database:', error.message);
  process.exit(1);
} finally {
  db.close();
}