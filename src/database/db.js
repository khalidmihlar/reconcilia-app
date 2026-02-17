export const patientQueries = {
    // Create new patient
    create: (doctorId, name, email, phone, dateOfBirth) => {
        const stmt = db.prepare(`
      INSERT INTO patients (doctor_id, name, email, phone, date_of_birth)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(doctorId, name, email, phone, dateOfBirth);
        return result.lastInsertRowid;
    },

    // Get all patients for a doctor
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

    // Get single patient by ID
    findById: (patientId) => {
        const stmt = db.prepare('SELECT * FROM patients WHERE id = ?');
        return stmt.get(patientId);
    },

    // Update patient
    update: (patientId, name, email, phone, dateOfBirth) => {
        const stmt = db.prepare(`
      UPDATE patients 
      SET name = ?, email = ?, phone = ?, date_of_birth = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        return stmt.run(name, email, phone, dateOfBirth, patientId);
    },

    // Delete patient
    delete: (patientId) => {
        const stmt = db.prepare('DELETE FROM patients WHERE id = ?');
        return stmt.run(patientId);
    }
};

// ==================== MEDICATION QUERIES ====================

export const medicationQueries = {
    // Create new medication
    create: (patientId, name, strength, form, dose, frequency, prescribed, comments) => {
        const stmt = db.prepare(`
      INSERT INTO medications (patient_id, name, strength, form, dose, frequency, prescribed, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(patientId, name, strength, form, dose, frequency, prescribed, comments);
        return result.lastInsertRowid;
    },

    // Get all medications for a patient
    getAllByPatient: (patientId) => {
        const stmt = db.prepare(`
      SELECT * FROM medications 
      WHERE patient_id = ?
      ORDER BY added_at DESC
    `);
        return stmt.all(patientId);
    },

    // Get single medication
    findById: (medicationId) => {
        const stmt = db.prepare('SELECT * FROM medications WHERE id = ?');
        return stmt.get(medicationId);
    },

    // Update medication
    update: (medicationId, name, strength, form, dose, frequency, prescribed, comments) => {
        const stmt = db.prepare(`
      UPDATE medications
      SET name = ?, strength = ?, form = ?, dose = ?, frequency = ?, prescribed = ?, comments = ?
      WHERE id = ?
    `);
        return stmt.run(name, strength, form, dose, frequency, prescribed, comments, medicationId);
    },

    // Delete medication
    delete: (medicationId) => {
        const stmt = db.prepare('DELETE FROM medications WHERE id = ?');
        return stmt.run(medicationId);
    }
};

// ==================== UTILITY FUNCTIONS ====================

export const utils = {
    // Get database stats
    getStats: () => {
        const doctorCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get();
        const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get();
        const medicationCount = db.prepare('SELECT COUNT(*) as count FROM medications').get();

        return {
            doctors: doctorCount.count,
            patients: patientCount.count,
            medications: medicationCount.count
        };
    },

    // Close database connection
    close: () => {
        db.close();
    }
};

export default db;