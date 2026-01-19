import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { medicationAPI, medicationCatalogAPI } from '../utils/api';

function AddMedication() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        strength: '',
        form: '',
        dose: '',
        frequency: '',
        prescribed: 'yes',
        comments: '',
        intendedDuration: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deletedWarning, setDeletedWarning] = useState(null);

    // Medication catalog state
    const [medications, setMedications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isOther, setIsOther] = useState(false);
    const [customMedName, setCustomMedName] = useState('');

    // Load all medications on mount
    useEffect(() => {
        loadMedications();
    }, []);

    const loadMedications = async () => {
        try {
            const response = await medicationCatalogAPI.getAll();
            setMedications(response.medications || []);
        } catch (err) {
            console.error('Failed to load medication catalog:', err);
        }
    };

    // Filter medications based on search (starts with)
    const filteredMedications = medications.filter(med =>
        med.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    const handleMedicationSelect = async (medication) => {
        setFormData({
            ...formData,
            name: medication.name,
            form: medication.form,
        });
        setSearchTerm(medication.name);
        setShowDropdown(false);
        setIsOther(false);

        // Check if this medication was previously deleted or archived
        try {
            console.log('Checking for previous medication:', medication.name);
            const response = await medicationAPI.checkIfDeleted(parseInt(id), medication.name);
            console.log('Check response:', response);

            if (response.wasFound) {
                setDeletedWarning(response);
            }
        } catch (err) {
            console.error('Failed to check deletion status:', err);
        }
    };

    const handleOtherSelect = () => {
        setIsOther(true);
        setShowDropdown(false);
        setSearchTerm('');
        setFormData({
            ...formData,
            name: '',
            form: '',
        });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowDropdown(true);

        // If typing and was "Other", switch back to catalog mode
        if (isOther && value) {
            setIsOther(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Adding medication for patient:', id);

            // Use custom name if "Other" is selected
            const medicationName = isOther ? customMedName : formData.name;

            if (!medicationName) {
                throw new Error('Please enter a medication name');
            }

            await medicationAPI.create(parseInt(id), {
                ...formData,
                name: medicationName,
            });

            console.log('Medication added successfully');

            // Navigate back to patient detail
            navigate(`/dashboard/patient/${id}`);
        } catch (err) {
            console.error('Create medication error:', err);
            setError(err.message || 'Failed to add medication. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate(`/dashboard/patient/${id}`)}
                className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Patient Details
            </button>

            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Add Medication</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Medication Name - Searchable Dropdown */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Medication Name *
                        </label>

                        {!isOther ? (
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onFocus={() => setShowDropdown(true)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent disabled:bg-gray-100"
                                        placeholder="Search medications..."
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Dropdown */}
                                {showDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredMedications.length > 0 ? (
                                            filteredMedications.slice(0, 50).map((med) => (
                                                <div
                                                    key={med.id}
                                                    onClick={() => handleMedicationSelect(med)}
                                                    className="px-4 py-2 hover:bg-[#E5F5F4] cursor-pointer flex justify-between items-center"
                                                >
                                                    <span className="font-medium">{med.name}</span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {med.form}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500 text-sm">
                                                No medications found
                                            </div>
                                        )}

                                        {/* Other Option */}
                                        <div
                                            onClick={handleOtherSelect}
                                            className="px-4 py-2 hover:bg-yellow-50 cursor-pointer border-t border-gray-200 font-medium text-[#3CA5A0]"
                                        >
                                            + Other (Enter custom medication)
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    value={customMedName}
                                    onChange={(e) => setCustomMedName(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent disabled:bg-gray-100"
                                    placeholder="Enter custom medication name (e.g., Aspirin 81 mg)"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOther(false);
                                        setCustomMedName('');
                                        setShowDropdown(true);
                                    }}
                                    className="mt-2 text-sm text-[#3CA5A0] hover:underline"
                                >
                                    ← Back to catalog
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Route of Administration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Route of Administration *
                        </label>
                        <select
                            name="form"
                            required
                            value={formData.form}
                            onChange={handleChange}
                            disabled={loading || (!isOther && !formData.name)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent disabled:bg-gray-100"
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
                        {!isOther && formData.name && (
                            <p className="text-xs text-gray-500 mt-1">
                                Auto-filled from catalog selection
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prescribed Dose *
                            </label>
                            <input
                                type="text"
                                name="dose"
                                required
                                value={formData.dose}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent disabled:bg-gray-100"
                                placeholder="e.g., 1 tablet"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Frequency *
                            </label>
                            <input
                                type="text"
                                name="frequency"
                                required
                                value={formData.frequency}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent disabled:bg-gray-100"
                                placeholder="e.g., Once daily"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Intended Duration
                        </label>
                        <input
                            type="text"
                            name="intendedDuration"
                            value={formData.intendedDuration}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent disabled:bg-gray-100"
                            placeholder="e.g., 30 days, 2 weeks, Ongoing"
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
                                    checked={formData.prescribed === 'yes'}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-4 h-4 text-[#3CA5A0] focus:ring-[#3CA5A0]"
                                />
                                <span className="ml-2 text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="prescribed"
                                    value="no"
                                    checked={formData.prescribed === 'no'}
                                    onChange={handleChange}
                                    disabled={loading}
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
                            value={formData.comments}
                            onChange={handleChange}
                            disabled={loading}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent disabled:bg-gray-100"
                            placeholder="Any additional notes about this medication..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#3CA5A0] text-white py-3 rounded-lg hover:bg-[#2d7e7a] font-medium transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Adding Medication...' : 'Add Medication'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/dashboard/patient/${id}`)}
                            disabled={loading}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Previous Medication Warning Modal */}
            {deletedWarning && deletedWarning.medication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className={`text-xl font-bold mb-4 ${deletedWarning.status === 'deleted' ? 'text-red-600' : 'text-orange-600'
                            }`}>
                            {deletedWarning.status === 'deleted' ? '🗑️ Previously Deleted' : '📦 Previously Archived'}
                        </h3>

                        <div className="space-y-3 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Medication Name</p>
                                <p className="font-semibold text-gray-800">{deletedWarning.medication.name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-sm text-gray-500">Route</p>
                                    <p className="font-medium text-gray-800">{deletedWarning.medication.form || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Dose</p>
                                    <p className="font-medium text-gray-800">{deletedWarning.medication.dose || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-sm text-gray-500">Frequency</p>
                                    <p className="font-medium text-gray-800">{deletedWarning.medication.frequency || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Prescribed</p>
                                    <p className="font-medium text-gray-800">
                                        {deletedWarning.medication.prescribed === 'yes' ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </div>

                            {deletedWarning.medication.intended_duration && (
                                <div>
                                    <p className="text-sm text-gray-500">Intended Duration</p>
                                    <p className="font-medium text-gray-800">{deletedWarning.medication.intended_duration}</p>
                                </div>
                            )}

                            {deletedWarning.medication.comments && (
                                <div>
                                    <p className="text-sm text-gray-500">Comments</p>
                                    <p className="font-medium text-gray-800">{deletedWarning.medication.comments}</p>
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-500">
                                    {deletedWarning.status === 'deleted' ? 'Deleted on' : 'Archived on'}
                                </p>
                                <p className="font-medium text-gray-800">
                                    {new Date(
                                        deletedWarning.status === 'deleted'
                                            ? deletedWarning.medication.deleted_at
                                            : deletedWarning.medication.archived_at
                                    ).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            {deletedWarning.medication.added_at && (
                                <div>
                                    <p className="text-sm text-gray-500">Originally Added</p>
                                    <p className="font-medium text-gray-800">
                                        {new Date(deletedWarning.medication.added_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-yellow-800">
                                {deletedWarning.status === 'deleted'
                                    ? 'This medication was previously removed from this patient\'s record.'
                                    : 'This medication was previously archived for this patient.'}
                                {' '}You can still add it again if needed.
                            </p>
                        </div>

                        <button
                            onClick={() => setDeletedWarning(null)}
                            className="w-full bg-[#3CA5A0] text-white py-3 rounded-lg hover:bg-[#2d7e7a] font-medium"
                        >
                            Understood, Continue Adding
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddMedication;