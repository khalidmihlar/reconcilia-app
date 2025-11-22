import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { medicationAPI } from '../utils/api';

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
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

            await medicationAPI.create(parseInt(id), formData);

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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Medication Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent disabled:bg-gray-100"
                            placeholder="e.g., Aspirin 81 mg"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Form *
                            </label>
                            <select
                                name="form"
                                required
                                value={formData.form}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent disabled:bg-gray-100"
                            >
                                <option value="">Select form</option>
                                <option value="Tablet">Tablet</option>
                                <option value="Capsule">Capsule</option>
                                <option value="Liquid">Liquid</option>
                                <option value="Injection">Injection</option>
                                <option value="Inhaler">Inhaler</option>
                                <option value="Cream">Cream</option>
                                <option value="Patch">Patch</option>
                                <option value="Other">Other</option>
                            </select>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dose *
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
                                placeholder="e.g., Twice daily"
                            />
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
        </div>
    );
}

export default AddMedication;