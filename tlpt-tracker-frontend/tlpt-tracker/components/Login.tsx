import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
    onLogin: (email: string, password: string) => Promise<User | null>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        console.log('🔍 Login form submitted with:', { email, password });
        const user = await onLogin(email, password);
        if (!user) {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-2xl">
                <h1 className="text-4xl font-extrabold text-center mb-2 text-primary">TLPT Tracker</h1>
                <p className="text-center text-text-secondary mb-8">Please sign in to continue</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                            Username or Email
                        </label>
                        <input
                            id="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-3 focus:ring-primary focus:border-primary"
                            autoComplete="email"
                            placeholder="Enter username or email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-3 focus:ring-primary focus:border-primary"
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <p className="text-danger text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
