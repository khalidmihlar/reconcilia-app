import express from 'express';
import cors from 'cors';
import { doctorQueries, patientQueries, medicationQueries } from './database.js';
import db from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ==================== AUTHENTICATION ROUTES ====================

// Login
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = doctorQueries.findByEmail(email);

        if (!doctor) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Simple password check (in production, use bcrypt)
        if (doctor.password_hash !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return doctor info without password
        const { password_hash, ...doctorInfo } = doctor;
        res.json({ doctor: doctorInfo });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register (optional for later)
app.post('/api/auth/register', (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if doctor already exists
        const existing = doctorQueries.findByEmail(email);
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create new doctor (in production, hash the password)
        const doctorId = doctorQueries.create(email, password, firstName, lastName);
        const doctor = doctorQueries.findById(doctorId);

        const { password_hash, ...doctorInfo } = doctor;
        res.status(201).json({ doctor: doctorInfo });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== PATIENT ROUTES ====================

// Get all patients for a doctor
app.get('/api/patients', (req, res) => {
    try {
        const { doctorId } = req.query;

        if (!doctorId) {
            return res.status(400).json({ error: 'Doctor ID required' });
        }

        const patients = patientQueries.getAllByDoctor(parseInt(doctorId));
        res.json({ patients });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single patient
app.get('/api/patients/:id', (req, res) => {
    try {
        const patient = patientQueries.findById(parseInt(req.params.id));

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json({ patient });
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create patient
app.post('/api/patients', (req, res) => {
    try {
        const { doctorId, name, email, phone, dateOfBirth } = req.body;

        if (!doctorId || !name) {
            return res.status(400).json({ error: 'Doctor ID and name required' });
        }

        const patientId = patientQueries.create(doctorId, name, email, phone, dateOfBirth);
        const patient = patientQueries.findById(patientId);

        res.status(201).json({ patient });
    } catch (error) {
        console.error('Create patient error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update patient
app.put('/api/patients/:id', (req, res) => {
    try {
        const { name, email, phone, dateOfBirth } = req.body;
        const patientId = parseInt(req.params.id);

        const changes = patientQueries.update(patientId, name, email, phone, dateOfBirth);

        if (changes === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const patient = patientQueries.findById(patientId);
        res.json({ patient });
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete patient
app.delete('/api/patients/:id', (req, res) => {
    try {
        const changes = patientQueries.delete(parseInt(req.params.id));

        if (changes === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== MEDICATION ROUTES ====================

// Get all medications for a patient
app.get('/api/patients/:patientId/medications', (req, res) => {
    try {
        const medications = medicationQueries.getAllByPatient(parseInt(req.params.patientId));
        res.json({ medications });
    } catch (error) {
        console.error('Get medications error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Replace the save-draft route in server/server.js with this:

// Save draft - batch update medication taking status, checklist, and reconciliation
app.post('/api/patients/:patientId/save-draft', (req, res) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const { medicationStatuses, checklist } = req.body;

        if (!Array.isArray(medicationStatuses)) {
            return res.status(400).json({ error: 'medicationStatuses must be an array' });
        }

        // Batch update all medication taking statuses
        medicationQueries.batchUpdateTaking(medicationStatuses);

        // Update checklist if provided
        if (checklist) {
            patientQueries.updateReconciliationChecklist(
                patientId,
                checklist.askedOtcs,
                checklist.askedAllergies,
                checklist.askedMedicationAccess
            );
        }

        // Get reconciliation status
        const status = patientQueries.getReconciliationStatus(patientId);

        // Determine if reconciled (all active medications are checked AND all checklist items are checked)
        const allMedsChecked = status.total_active > 0 &&
            status.total_active === status.checked_active;

        const allChecklistChecked = status.asked_otcs_topicals_injectables === 1 &&
            status.asked_allergies === 1 &&
            status.asked_medication_access === 1;

        const isReconciled = allMedsChecked && allChecklistChecked;

        // Update patient reconciliation status
        patientQueries.updateReconciliationStatus(patientId, isReconciled);

        // Get updated patient info
        const patient = patientQueries.findById(patientId);

        res.json({
            patient,
            isReconciled,
            totalActive: status.total_active,
            checkedActive: status.checked_active,
            checklistComplete: allChecklistChecked,
            message: isReconciled
                ? 'Patient marked as reconciled'
                : allMedsChecked
                    ? 'Medications complete - please complete checklist'
                    : 'Draft saved - not all medications reviewed'
        });
    } catch (error) {
        console.error('Save draft error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single medication
app.get('/api/medications/:id', (req, res) => {
    try {
        const medication = medicationQueries.findById(parseInt(req.params.id));

        if (!medication) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        res.json({ medication });
    } catch (error) {
        console.error('Get medication error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.patch('/api/medications/:id/status', (req, res) => {
    try {
        const medicationId = parseInt(req.params.id);
        const { status } = req.body;

        if (!['active', 'archived'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be active or archived' });
        }

        const changes = medicationQueries.updateStatus(medicationId, status);

        if (changes === 0) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        const medication = medicationQueries.findById(medicationId);
        res.json({ medication });
    } catch (error) {
        console.error('Update medication status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update medication is_taking checkbox
app.patch('/api/medications/:id/taking', (req, res) => {
    try {
        const medicationId = parseInt(req.params.id);
        const { isTaking } = req.body;

        const changes = medicationQueries.updateIsTaking(medicationId, isTaking);

        if (changes === 0) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        const medication = medicationQueries.findById(medicationId);
        res.json({ medication });
    } catch (error) {
        console.error('Update medication taking status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get active medications only
app.get('/api/patients/:patientId/medications/active', (req, res) => {
    try {
        const medications = medicationQueries.getActiveByPatient(parseInt(req.params.patientId));
        res.json({ medications });
    } catch (error) {
        console.error('Get active medications error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get archived medications only
app.get('/api/patients/:patientId/medications/archived', (req, res) => {
    try {
        const medications = medicationQueries.getArchivedByPatient(parseInt(req.params.patientId));
        res.json({ medications });
    } catch (error) {
        console.error('Get archived medications error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create medication
app.post('/api/patients/:patientId/medications', (req, res) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const { name, strength, form, dose, frequency, prescribed, comments } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Medication name required' });
        }

        const medicationId = medicationQueries.create(
            patientId, name, strength, form, dose, frequency, prescribed, comments
        );
        const medication = medicationQueries.findById(medicationId);

        res.status(201).json({ medication });
    } catch (error) {
        console.error('Create medication error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/medication-catalog', (req, res) => {
    try {
        const medications = db.prepare('SELECT * FROM medication_catalog ORDER BY name').all();
        res.json({ medications });
    } catch (error) {
        console.error('Get medication catalog error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Search medications by name
app.get('/api/medication-catalog/search', (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.json({ medications: [] });
        }

        const medications = db.prepare(`
      SELECT * FROM medication_catalog 
      WHERE name LIKE ? 
      ORDER BY name 
      LIMIT 50
    `).all(`%${query}%`);

        res.json({ medications });
    } catch (error) {
        console.error('Search medication catalog error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update medication
app.put('/api/medications/:id', (req, res) => {
    try {
        const medicationId = parseInt(req.params.id);
        const { name, strength, form, dose, frequency, prescribed, comments } = req.body;

        const changes = medicationQueries.update(
            medicationId, name, strength, form, dose, frequency, prescribed, comments
        );

        if (changes === 0) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        const medication = medicationQueries.findById(medicationId);
        res.json({ medication });
    } catch (error) {
        console.error('Update medication error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete medication
app.delete('/api/medications/:id', (req, res) => {
    try {
        const changes = medicationQueries.delete(parseInt(req.params.id));

        if (changes === 0) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        res.json({ message: 'Medication deleted successfully' });
    } catch (error) {
        console.error('Delete medication error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Reconcila API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Reconcila API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});



export default app;