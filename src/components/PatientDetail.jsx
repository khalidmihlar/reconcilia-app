import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Pill, Calendar, User, Mail, Phone, Archive, Trash2, ArchiveRestore, Save } from 'lucide-react';
import { patientAPI, medicationAPI } from '../utils/api';

function PatientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeMeds, setActiveMeds] = useState([]);
    const [archivedMeds, setArchivedMeds] = useState([]);
    const [showArchived, setShowArchived] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [editingMed, setEditingMed] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    // Track checkbox states locally (not saved until "Save Draft")
    const [medicationChecks, setMedicationChecks] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Reconciliation checklist
    const [checklist, setChecklist] = useState({
        askedOtcs: false,
        askedAllergies: false,
        askedMedicationAccess: false,
    });

    useEffect(() => {
        console.log('=== PatientDetail mounted for patient ID:', id, '===');
        loadPatient();
    }, [id]);

    const loadPatient = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Fetching patient data for ID:', id);

            const patientResponse = await patientAPI.getById(parseInt(id));
            console.log('Patient response:', patientResponse);

            const medicationsResponse = await medicationAPI.getAllByPatient(parseInt(id));
            console.log('Medications response:', medicationsResponse);

            const allMeds = medicationsResponse.medications || [];
            const active = allMeds.filter(med => med.status === 'active');
            const archived = allMeds.filter(med => med.status === 'archived');

            setPatient(patientResponse.patient);
            setActiveMeds(active);
            setArchivedMeds(archived);

            // Initialize checkbox states from database
            const checks = {};
            active.forEach(med => {
                checks[med.id] = med.is_taking === 1;
            });
            setMedicationChecks(checks);

            // Initialize checklist from database
            setChecklist({
                askedOtcs: patientResponse.patient.asked_otcs_topicals_injectables === 1,
                askedAllergies: patientResponse.patient.asked_allergies === 1,
                askedMedicationAccess: patientResponse.patient.asked_medication_access === 1,
            });

            setHasUnsavedChanges(false);
        } catch (err) {
            console.error('❌ Load patient error:', err);
            setError('Failed to load patient details: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTaking = (medicationId) => {
        setMedicationChecks(prev => ({
            ...prev,
            [medicationId]: !prev[medicationId]
        }));
        setHasUnsavedChanges(true);
    };

    const handleChecklistToggle = (field) => {
        setChecklist(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
        setHasUnsavedChanges(true);
    };

    const handleSaveDraft = async () => {
        try {
            setSaving(true);

            // Prepare medication statuses array
            const medicationStatuses = activeMeds.map(med => ({
                id: med.id,
                isTaking: medicationChecks[med.id] || false
            }));

            console.log('Saving draft with statuses:', medicationStatuses);
            console.log('Saving checklist:', checklist);

            const response = await patientAPI.saveDraft(parseInt(id), medicationStatuses, checklist);

            console.log('Save response:', response);

            // Show success message
            alert(response.message);

            // Reload patient data
            await loadPatient();

        } catch (err) {
            console.error('Failed to save draft:', err);
            alert('Failed to save changes: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async (medicationId) => {
        try {
            await medicationAPI.updateStatus(medicationId, 'archived');
            await loadPatient();
        } catch (err) {
            console.error('Failed to archive medication:', err);
            alert('Failed to archive medication');
        }
    };

    const handleUnarchive = async (medicationId) => {
        try {
            await medicationAPI.updateStatus(medicationId, 'active');
            await loadPatient();
        } catch (err) {
            console.error('Failed to unarchive medication:', err);
            alert('Failed to unarchive medication');
        }
    };

    const handleDelete = async (medicationId) => {
        try {
            await medicationAPI.delete(medicationId);
            setDeleteConfirm(null);
            await loadPatient();
        } catch (err) {
            console.error('Failed to delete medication:', err);
            alert('Failed to delete medication');
        }
    };

    const handleEditClick = (med) => {
        setEditingMed(med);
        setEditForm({
            name: med.name,
            form: med.form,
            dose: med.dose,
            frequency: med.frequency,
            prescribed: med.prescribed,
            comments: med.comments || '',
            intendedDuration: med.intended_duration || '',
        });
    };

    const handleEditChange = (e) => {
        setEditForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleEditSave = async () => {
        try {
            setSaving(true);
            await medicationAPI.update(editingMed.id, editForm);
            setEditingMed(null);
            await loadPatient();
        } catch (err) {
            console.error('Failed to update medication:', err);
            alert('Failed to update medication');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days`;
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-xl text-gray-600">Loading patient details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-xl text-red-600">{error}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 px-6 py-2 bg-[#3CA5A0] text-white rounded-lg hover:bg-[#2d7e7a]"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-12">
                <p className="text-xl text-gray-600">Patient not found</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 px-6 py-2 bg-[#3CA5A0] text-white rounded-lg hover:bg-[#2d7e7a]"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const MedicationCard = ({ med, isArchived }) => (
        <div className={`border rounded-lg p-4 transition-colors ${isArchived ? 'border-gray-300 bg-gray-50' : 'border-gray-200 hover:border-[#3CA5A0]'
            }`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                    {!isArchived && (
                        <input
                            type="checkbox"
                            checked={medicationChecks[med.id] || false}
                            onChange={() => handleToggleTaking(med.id)}
                            className="mt-1 mr-3 w-5 h-5 text-[#3CA5A0] rounded focus:ring-[#3CA5A0] cursor-pointer"
                        />
                    )}
                    <div className="flex-1">
                        <h4 className={`text-lg font-semibold mb-2 ${isArchived ? 'text-gray-500' : 'text-gray-800'
                            }`}>
                            {med.name}
                        </h4>

                        {/* Duration Display */}
                        {isArchived && med.archived_at ? (
                            <p className="text-sm text-gray-600 mb-2">
                                Active: {formatDate(med.added_at)} - {formatDate(med.archived_at)} ({calculateDuration(med.added_at, med.archived_at)})
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600 mb-2">
                                Started: {formatDate(med.added_at)}
                                {med.intended_duration && ` • Until: ${formatDate(med.intended_duration)}`}
                            </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Route:</span>
                                <p className="font-medium text-gray-800">{med.form || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Prescribed Dose:</span>
                                <p className="font-medium text-gray-800">{med.dose || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Frequency:</span>
                                <p className="font-medium text-gray-800">{med.frequency || 'N/A'}</p>
                            </div>
                        </div>
                        {med.comments && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Comments:</span> {med.comments}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${med.prescribed === 'yes'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {med.prescribed === 'yes' ? 'Prescribed' : 'Not Prescribed'}
                    </span>

                    <div className="flex gap-2">
                        {!isArchived && (
                            <button
                                onClick={() => handleEditClick(med)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit medication"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        )}
                        {!isArchived ? (
                            <button
                                onClick={() => handleArchive(med.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                title="Archive medication"
                            >
                                <Archive className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={() => handleUnarchive(med.id)}
                                className="p-2 text-[#3CA5A0] hover:bg-[#E5F5F4] rounded transition-colors"
                                title="Restore to active"
                            >
                                <ArchiveRestore className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setDeleteConfirm(med.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete medication"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const allChecked = activeMeds.length > 0 && activeMeds.every(med => medicationChecks[med.id]);
    const checkedCount = activeMeds.filter(med => medicationChecks[med.id]).length;

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
            </button>

            {/* Patient Info Card */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-[#E5F5F4] rounded-full flex items-center justify-center mr-4">
                        <User className="w-8 h-8 text-[#3CA5A0]" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{patient.name}</h2>
                        <p className="text-gray-500">Patient ID: {patient.id}</p>
                        {patient.is_reconciled === 1 && (
                            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                ✓ Reconciled
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-gray-700">
                        <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                        <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-medium">{patient.date_of_birth || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                        <Mail className="w-5 h-5 mr-3 text-gray-500" />
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{patient.email || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                        <Phone className="w-5 h-5 mr-3 text-gray-500" />
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{patient.phone || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Medications Section */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            Active Medications ({activeMeds.length})
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {checkedCount} of {activeMeds.length} reviewed
                            {allChecked && activeMeds.length > 0 && (
                                <span className="ml-2 text-green-600 font-medium">✓ All reviewed</span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/dashboard/patient/${id}/add-medication`)}
                        className="flex items-center px-4 py-2 bg-[#3CA5A0] text-white rounded-lg hover:bg-[#2d7e7a]"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Medication
                    </button>
                </div>

                {activeMeds.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <Pill className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500 mb-4">No active medications</p>
                        <button
                            onClick={() => navigate(`/dashboard/patient/${id}/add-medication`)}
                            className="px-6 py-2 bg-[#3CA5A0] text-white rounded-lg hover:bg-[#2d7e7a]"
                        >
                            Add First Medication
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 mb-6">
                            {activeMeds.map((med) => (
                                <MedicationCard key={med.id} med={med} isArchived={false} />
                            ))}
                        </div>

                        {/* Reconciliation Checklist */}
                        <div className="bg-[#E5F5F4] rounded-lg p-6 mb-6 border-2 border-[#3CA5A0]">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">📋</span>
                                Did you ask about...
                            </h4>
                            <div className="space-y-3">
                                <label className="flex items-start cursor-pointer hover:bg-white/50 p-2 rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={checklist.askedOtcs}
                                        onChange={() => handleChecklistToggle('askedOtcs')}
                                        className="mt-0.5 mr-3 w-5 h-5 text-[#3CA5A0] rounded focus:ring-[#3CA5A0] cursor-pointer flex-shrink-0"
                                    />
                                    <span className="text-gray-800 font-medium">
                                        OTCs, topicals, injectables?
                                    </span>
                                </label>

                                <label className="flex items-start cursor-pointer hover:bg-white/50 p-2 rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={checklist.askedAllergies}
                                        onChange={() => handleChecklistToggle('askedAllergies')}
                                        className="mt-0.5 mr-3 w-5 h-5 text-[#3CA5A0] rounded focus:ring-[#3CA5A0] cursor-pointer flex-shrink-0"
                                    />
                                    <span className="text-gray-800 font-medium">
                                        Allergies?
                                    </span>
                                </label>

                                <label className="flex items-start cursor-pointer hover:bg-white/50 p-2 rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={checklist.askedMedicationAccess}
                                        onChange={() => handleChecklistToggle('askedMedicationAccess')}
                                        className="mt-0.5 mr-3 w-5 h-5 text-[#3CA5A0] rounded focus:ring-[#3CA5A0] cursor-pointer flex-shrink-0"
                                    />
                                    <span className="text-gray-800 font-medium">
                                        Medication access?
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Save Draft Button */}
                        <div className="border-t pt-6">
                            <button
                                onClick={handleSaveDraft}
                                disabled={saving || !hasUnsavedChanges}
                                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${hasUnsavedChanges
                                        ? 'bg-[#3CA5A0] text-white hover:bg-[#2d7e7a]'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Draft' : 'No Changes to Save'}
                            </button>
                            {hasUnsavedChanges && (
                                <p className="text-sm text-orange-600 text-center mt-2">
                                    You have unsaved changes
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Archived Medications Section */}
            {archivedMeds.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className="w-full flex justify-between items-center mb-4"
                    >
                        <h3 className="text-xl font-bold text-gray-700">
                            Archived Medications ({archivedMeds.length})
                        </h3>
                        <span className="text-gray-500">
                            {showArchived ? '▼' : '▶'}
                        </span>
                    </button>

                    {showArchived && (
                        <div className="space-y-4">
                            {archivedMeds.map((med) => (
                                <MedicationCard key={med.id} med={med} isArchived={true} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Medication?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to permanently delete this medication? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Medication Modal */}
            {editingMed && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Medication</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Medication Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Route of Administration *
                                </label>
                                <select
                                    name="form"
                                    value={editForm.form}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent"
                                >
                                    <option value="">Select route</option>
                                    <option value="Oral">Oral</option>
                                    <option value="Sublingual">Sublingual</option>
                                    <option value="Buccal">Buccal</option>
                                    <option value="Intravenous">Intravenous (IV)</option>
                                    <option value="Intramuscular">Intramuscular (IM)</option>
                                    <option value="Subcutaneous">Subcutaneous (SC)</option>
                                    <option value="Topical">Topical</option>
                                    <option value="Transdermal">Transdermal</option>
                                    <option value="Inhalation">Inhalation</option>
                                    <option value="Nasal">Nasal</option>
                                    <option value="Ophthalmic">Ophthalmic</option>
                                    <option value="Otic">Otic</option>
                                    <option value="Rectal">Rectal</option>
                                    <option value="Vaginal">Vaginal</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prescribed Dose *
                                    </label>
                                    <input
                                        type="text"
                                        name="dose"
                                        value={editForm.dose}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Frequency *
                                    </label>
                                    <input
                                        type="text"
                                        name="frequency"
                                        value={editForm.frequency}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Intended Duration
                                </label>
                                <input
                                    type="date"
                                    name="intendedDuration"
                                    value={editForm.intendedDuration}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prescribed? *
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="prescribed"
                                            value="yes"
                                            checked={editForm.prescribed === 'yes'}
                                            onChange={handleEditChange}
                                            className="w-4 h-4 text-[#3CA5A0] focus:ring-[#3CA5A0]"
                                        />
                                        <span className="ml-2 text-gray-700">Yes</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="prescribed"
                                            value="no"
                                            checked={editForm.prescribed === 'no'}
                                            onChange={handleEditChange}
                                            className="w-4 h-4 text-[#3CA5A0] focus:ring-[#3CA5A0]"
                                        />
                                        <span className="ml-2 text-gray-700">No</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Comments
                                </label>
                                <textarea
                                    name="comments"
                                    value={editForm.comments}
                                    onChange={handleEditChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleEditSave}
                                disabled={saving}
                                className="flex-1 bg-[#3CA5A0] text-white py-3 rounded-lg hover:bg-[#2d7e7a] font-medium disabled:bg-gray-400"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={() => setEditingMed(null)}
                                disabled={saving}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PatientDetail;