import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, UserPlus, Users } from 'lucide-react';
import PatientList from './components/PatientList';
import AddPatient from './components/AddPatient';
import PatientDetail from './components/PatientDetail';
import AddMedication from './components/AddMedication';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">Reconcila</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Patients
                </Link>
                <Link
                  to="/add-patient"
                  className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Patient
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<PatientList />} />
            <Route path="/add-patient" element={<AddPatient />} />
            <Route path="/patient/:id" element={<PatientDetail />} />
            <Route path="/patient/:id/add-medication" element={<AddMedication />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;