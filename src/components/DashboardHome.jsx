import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, Plus } from 'lucide-react';

function DashboardHome({ user }) {
    const [patients, setPatients] = useState([]);
    const [unreviewedLists, setUnreviewedLists] = useState([]);
    const [reconciledLists, setReconciledLists] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Load patients from localStorage
        const storedPatients = localStorage.getItem('patients');
        if (storedPatients) {
            const allPatients = JSON.parse(storedPatients);
            setPatients(allPatients);

            // Separate into unreviewed and reconciled
            // For now, we'll randomly assign some as reconciled for demo
            const unreviewed = allPatients.filter((_, idx) => idx % 3 !== 0);
            const reconciled = allPatients.filter((_, idx) => idx % 3 === 0);

            setUnreviewedLists(unreviewed);
            setReconciledLists(reconciled);
        }
    }, []);

    const handlePatientClick = (patientId) => {
        navigate(`/dashboard/patient/${patientId}`);
    };

    const getRandomColor = (index) => {
        const colors = [
            'from-purple-400 to-purple-600',
            'from-pink-400 to-pink-600',
            'from-blue-400 to-blue-600',
            'from-green-400 to-green-600',
            'from-teal-400 to-teal-600',
            'from-orange-400 to-orange-600',
            'from-indigo-400 to-indigo-600',
            'from-red-400 to-red-600',
        ];
        return colors[index % colors.length];
    };

    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age;
    };

    return (
        <div>
            {/* Provider Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-[#3CA5A0] rounded-full flex items-center justify-center">
                            <User className="w-16 h-16 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {user?.email?.split('@')[0] || 'Healthcare Provider'}
                            </h2>
                            <p className="text-gray-600 mt-1">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex space-x-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#3CA5A0]">{unreviewedLists.length}</div>
                            <div className="text-sm text-gray-600 mt-1">
                                Unreviewed
                                <br />
                                Lists
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#3CA5A0]">{reconciledLists.length}</div>
                            <div className="text-sm text-gray-600 mt-1">
                                Reconciled
                                <br />
                                Lists
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#3CA5A0]">{patients.length}</div>
                            <div className="text-sm text-gray-600 mt-1">
                                Total
                                <br />
                                Patients
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unreviewed Lists Section */}
            {unreviewedLists.length > 0 && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-800">Unreviewed Lists</h3>
                        <button className="text-[#3CA5A0] font-semibold hover:text-[#2d7e7a]">
                            See All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {unreviewedLists.slice(0, 4).map((patient, index) => (
                            <div
                                key={patient.id}
                                onClick={() => handlePatientClick(patient.id)}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                            >
                                <div className="p-6">
                                    <div
                                        className={`w-20 h-20 bg-gradient-to-br ${getRandomColor(
                                            index
                                        )} rounded-full mx-auto mb-4 flex items-center justify-center`}
                                    >
                                        <User className="w-12 h-12 text-white" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800 text-center">
                                        {patient.name.split(' ')[0]} {patient.name.split(' ')[1]?.[0]}., {calculateAge(patient.dateOfBirth)}
                                    </h4>
                                    <p className="text-sm text-gray-600 text-center mt-1">
                                        {patient.medications?.length || 0} medications
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Tips for Medication Reconciliation
                    </h3>
                    <button className="text-[#3CA5A0] font-semibold hover:text-[#2d7e7a]">
                        See All
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 flex space-x-6">
                    <div className="w-48 h-36 bg-[#E5F5F4] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-32 h-32" viewBox="0 0 200 150">
                            <circle cx="60" cy="50" r="20" fill="#FF6B9D" />
                            <circle cx="100" cy="70" r="25" fill="#87CEEB" />
                            <circle cx="140" cy="55" r="18" fill="#FFD700" />
                            <circle cx="80" cy="100" r="22" fill="#FF6347" />
                            <circle cx="130" cy="110" r="20" fill="#98D8C8" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-800 mb-2">
                            Commonly Missed Medications
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Here are key ways to avoid missing medications after the appointment that may
                            be on a medication list that may be overlooked when checking for missing
                            crucial medications.
                        </p>
                        <p className="text-xs text-gray-500 mt-3">3K ⭐ 134</p>
                    </div>
                </div>
            </div>

            {/* Reconciled Lists Section */}
            {reconciledLists.length > 0 && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-800">Reconciled Lists</h3>
                        <button className="text-[#3CA5A0] font-semibold hover:text-[#2d7e7a]">
                            See All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {reconciledLists.slice(0, 4).map((patient, index) => (
                            <div
                                key={patient.id}
                                onClick={() => handlePatientClick(patient.id)}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border-2 border-green-200"
                            >
                                <div className="p-6">
                                    <div
                                        className={`w-20 h-20 bg-gradient-to-br ${getRandomColor(
                                            index + 4
                                        )} rounded-full mx-auto mb-4 flex items-center justify-center`}
                                    >
                                        <User className="w-12 h-12 text-white" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800 text-center">
                                        {patient.name.split(' ')[0]} {patient.name.split(' ')[1]?.[0]}., {calculateAge(patient.dateOfBirth)}
                                    </h4>
                                    <p className="text-sm text-gray-600 text-center mt-1">
                                        {patient.medications?.length || 0} medications
                                    </p>
                                    <p className="text-xs text-green-600 text-center mt-2 font-semibold">
                                        ✓ Reconciled
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {patients.length === 0 && (
                <div className="text-center py-12">
                    <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Patients Yet</h2>
                    <p className="text-gray-500 mb-6">Get started by adding your first patient</p>
                </div>
            )}

            {/* Quick Action Button */}
            <div className="text-center">
                <button
                    onClick={() => navigate('/dashboard/add-patient')}
                    className="bg-[#3CA5A0] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#2d7e7a] shadow-lg hover:shadow-xl transition-all inline-flex items-center"
                >
                    <Plus className="w-6 h-6 mr-2" />
                    Add New Patient
                </button>
            </div>
        </div>
    );
}

export default DashboardHome;