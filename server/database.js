import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../reconcila.db');

// Check if database exists
const dbExists = fs.existsSync(dbPath);

if (dbExists) {
    console.log('✅ Found existing database at:', dbPath);
} else {
    console.log('🆕 Creating new database at:', dbPath);
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Initialize database schema if it doesn't exist
function initializeDatabase() {
    console.log('🔧 Initializing database schema...');

    // Create Doctors table
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
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
    CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
  `);

    // Create test doctor if no doctors exist
    const doctorCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get();
    if (doctorCount.count === 0) {
        console.log('👤 Creating default test doctor...');
        db.prepare(`
      INSERT INTO doctors (email, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?)
    `).run('test@example.com', 'password123', 'Test', 'Doctor');
        console.log('   Email: test@example.com');
        console.log('   Password: password123');
    }

    console.log('✅ Database schema initialized');
}

// Initialize on module load
initializeDatabase();

// ==================== DOCTOR QUERIES ====================

export const doctorQueries = {
    findByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM doctors WHERE email = ?');
        return stmt.get(email);
    },

    create: (email, passwordHash, firstName, lastName) => {
        const stmt = db.prepare(`
      INSERT INTO doctors (email, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?)
    `);
        const result = stmt.run(email, passwordHash, firstName, lastName);
        return result.lastInsertRowid;
    },

    findById: (id) => {
        const stmt = db.prepare('SELECT id, email, first_name, last_name, created_at FROM doctors WHERE id = ?');
        return stmt.get(id);
    }
};

// ==================== PATIENT QUERIES ====================

export const patientQueries = {
    create: (doctorId, name, email, phone, dateOfBirth) => {
        const stmt = db.prepare(`
      INSERT INTO patients (doctor_id, name, email, phone, date_of_birth)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(doctorId, name, email, phone, dateOfBirth);
        return result.lastInsertRowid;
    },

    getAllByDoctor: (doctorId) => {
        const stmt = db.prepare(`
      SELECT p.*, 
             (SELECT COUNT(*) FROM medications WHERE patient_id = p.id) as medication_count
      FROM patients p
      WHERE p.doctor_id = ?
      ORDER BY p.created_at DESC
    `);
        return stmt.all(doctorId);
    },

    findById: (patientId) => {
        const stmt = db.prepare('SELECT * FROM patients WHERE id = ?');
        return stmt.get(patientId);
    },

    update: (patientId, name, email, phone, dateOfBirth) => {
        const stmt = db.prepare(`
      UPDATE patients 
      SET name = ?, email = ?, phone = ?, date_of_birth = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        const result = stmt.run(name, email, phone, dateOfBirth, patientId);
        return result.changes;
    },

    delete: (patientId) => {
        const stmt = db.prepare('DELETE FROM patients WHERE id = ?');
        const result = stmt.run(patientId);
        return result.changes;
    }
};

// ==================== MEDICATION QUERIES ====================

export const medicationQueries = {
    create: (patientId, name, strength, form, dose, frequency, prescribed, comments) => {
        const stmt = db.prepare(`
      INSERT INTO medications (patient_id, name, strength, form, dose, frequency, prescribed, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(patientId, name, strength, form, dose, frequency, prescribed, comments);
        return result.lastInsertRowid;
    },

    getAllByPatient: (patientId) => {
        const stmt = db.prepare(`
      SELECT * FROM medications 
      WHERE patient_id = ?
      ORDER BY added_at DESC
    `);
        return stmt.all(patientId);
    },

    findById: (medicationId) => {
        const stmt = db.prepare('SELECT * FROM medications WHERE id = ?');
        return stmt.get(medicationId);
    },

    update: (medicationId, name, strength, form, dose, frequency, prescribed, comments) => {
        const stmt = db.prepare(`
      UPDATE medications
      SET name = ?, strength = ?, form = ?, dose = ?, frequency = ?, prescribed = ?, comments = ?
      WHERE id = ?
    `);
        const result = stmt.run(name, strength, form, dose, frequency, prescribed, comments, medicationId);
        return result.changes;
    },

    delete: (medicationId) => {
        const stmt = db.prepare('DELETE FROM medications WHERE id = ?');
        const result = stmt.run(medicationId);
        return result.changes;
    }
};

export default db;