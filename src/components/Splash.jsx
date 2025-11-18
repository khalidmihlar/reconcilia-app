import { useState } from 'react';
import { Pill, ArrowRight } from 'lucide-react';

function Splash({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Simple validation for MVP
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        // For MVP, accept any email/password combo
        // Store user session
        const user = {
            email: email,
            loggedInAt: new Date().toISOString(),
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        onLogin(user);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#3CA5A0] via-[#2d7e7a] to-[#1e5855] flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
                        <Pill className="w-10 h-10 text-[#3CA5A0]" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-2">Reconcila</h1>
                    <p className="text-teal-100 text-lg">Medication Reconciliation Platform</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3CA5A0] focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#3CA5A0] text-white py-3 rounded-lg hover:bg-[#2d7e7a] font-medium transition-colors flex items-center justify-center group"
                        >
                            Sign In
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>Demo: Use any email/password to login</p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-teal-100 text-sm mt-8">
                    © 2024 Reconcila. Simplifying medication management.
                </p>
            </div>
        </div>
    );
}

export default Splash;