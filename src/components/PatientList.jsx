import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, Calendar, Mail, Phone } from 'lucide-react';

function PatientList() {
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Load patients from localStorage
        const storedPatients = localStorage.getItem('patients');
        if (storedPatients) {
            setPatients(JSON.parse(storedPatients));
        }
    }, []);

    const handlePatientClick = (patientId) => {
        navigate(`/dashboard/patient/${patientId}`);
    };

    if (patients.length === 0) {
        return (
            <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Patients Yet</h2>
                <p className="text-gray-500 mb-6">Get started by adding your first patient</p>
                <button
                    onClick={() => navigate('/dashboard/add-patient')}
                    className="px-6 py-3 bg-[#3CA5A0] text-white rounded-lg hover:bg-[#2d7e7a] font-medium"
                >
                    Add Your First Patient
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Patient Directory</h2>
                <p className="text-gray-600 mt-2">Total Patients: {patients.length}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient) => (
                    <div
                        key={patient.id}
                        onClick={() => handlePatientClick(patient.id)}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#3CA5A0]"
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-[#E5F5F4] rounded-full flex items-center justify-center mr-4">
                                <User className="w-6 h-6 text-[#3CA5A0]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
                                <p className="text-sm text-gray-500">ID: {patient.id}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>DOB: {patient.dateOfBirth}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                <span>{patient.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                <span>{patient.phone}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PatientList;