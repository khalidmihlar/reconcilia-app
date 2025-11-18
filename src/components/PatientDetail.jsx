import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Pill, Calendar, User, Mail, Phone } from 'lucide-react';
import { patientAPI, medicationAPI } from '../utils/api';

function PatientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('=== PatientDetail mounted for patient ID:', id, '===');
        loadPatient();
    }, [id]);

    const loadPatient = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Fetching patient data for ID:', id);

            // Fetch patient data
            const patientResponse = await patientAPI.getById(parseInt(id));
            console.log('Patient response:', patientResponse);

            // Fetch medications for this patient
            const medicationsResponse = await medicationAPI.getAllByPatient(parseInt(id));
            console.log('Medications response:', medicationsResponse);

            // Combine patient data with medications
            const patientWithMeds = {
                ...patientResponse.patient,
                medications: medicationsResponse.medications || []
            };

            console.log('Combined patient data:', patientWithMeds);
            setPatient(patientWithMeds);
        } catch (err) {
            console.error('❌ Load patient error:', err);
            setError('Failed to load patient details: ' + err.message);
        } finally {
            setLoading(false);
        }
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

            {/* Medications Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Medications</h3>
                    <button
                        onClick={() => navigate(`/dashboard/patient/${id}/add-medication`)}
                        className="flex items-center px-4 py-2 bg-[#3CA5A0] text-white rounded-lg hover:bg-[#2d7e7a]"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Medication
                    </button>
                </div>

                {!patient.medications || patient.medications.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <Pill className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500 mb-4">No medications recorded yet</p>
                        <button
                            onClick={() => navigate(`/dashboard/patient/${id}/add-medication`)}
                            className="px-6 py-2 bg-[#3CA5A0] text-white rounded-lg hover:bg-[#2d7e7a]"
                        >
                            Add First Medication
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {patient.medications.map((med) => (
                            <div
                                key={med.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-[#3CA5A0] transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                            {med.name}
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">Strength:</span>
                                                <p className="font-medium text-gray-800">{med.strength || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Form:</span>
                                                <p className="font-medium text-gray-800">{med.form || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Dose:</span>
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
                                    <div className="ml-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${med.prescribed === 'yes'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {med.prescribed === 'yes' ? 'Prescribed' : 'Not Prescribed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientDetail;