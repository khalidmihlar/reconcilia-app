import { Routes, Route, Link } from 'react-router-dom';
import { UserPlus, Users, LogOut } from 'lucide-react';
import DashboardHome from './DashboardHome';
import AddPatient from './AddPatient';
import PatientDetail from './PatientDetail';
import AddMedication from './AddMedication';

function Dashboard({ user, onLogout }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/dashboard" className="text-2xl font-bold text-[#3CA5A0]">
                                Reconcila
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/dashboard"
                                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#3CA5A0] hover:bg-gray-100"
                            >
                                <Users className="w-5 h-5 mr-2" />
                                Dashboard
                            </Link>
                            <Link
                                to="/dashboard/add-patient"
                                className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#3CA5A0] hover:bg-[#2d7e7a]"
                            >
                                <UserPlus className="w-5 h-5 mr-2" />
                                Add Patient
                            </Link>
                            <button
                                onClick={onLogout}
                                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                    <Route path="/" element={<DashboardHome user={user} />} />
                    <Route path="/add-patient" element={<AddPatient user={user} />} />
                    <Route path="/patient/:id" element={<PatientDetail user={user} />} />
                    <Route path="/patient/:id/add-medication" element={<AddMedication user={user} />} />
                </Routes>
            </main>
        </div>
    );
}

export default Dashboard;