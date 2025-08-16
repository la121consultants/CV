import React, { useState } from 'react';
import { Button } from './Button';
import { LogIn, AlertCircle, Mail, Key } from 'lucide-react';
import type { LoggedInUser } from '../types';

// The full user object stored locally, including the password
interface StoredUser extends LoggedInUser {
    password?: string;
}

interface UserLoginProps {
    onLoginSuccess: (user: LoggedInUser) => void;
}

const USER_STORAGE_KEY = 'la121Users';
const PRIMARY_ADMIN_EMAIL = 'admin@la121consultants.co.uk';

export const UserLogin: React.FC<UserLoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
            setError('Administrators must use the "Admin Login" page.');
            return;
        }

        const usersRaw = localStorage.getItem(USER_STORAGE_KEY);
        const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (user && user.password === password) {
            const { password: userPassword, ...userToLogin } = user;
            onLoginSuccess(userToLogin as LoggedInUser);
        } else {
            setError('Invalid email or password.');
        }
    };
    
    return (
        <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">User Login</h1>
            <p className="text-center text-gray-500 mb-8">Enter your credentials to access the service.</p>
            
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 p-3 rounded-lg flex items-center text-sm mb-4">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0"/>
                    <span>{error}</span>
                </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
                <InputField type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" icon={<Mail />} />
                <InputField type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" icon={<Key />} />
                <div className="pt-2">
                     <Button type="submit" className="w-full">
                        <LogIn className="mr-2 h-5 w-5" /> Login
                    </Button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">Need access? Please contact the site administrator.</p>
            </div>
        </div>
    );
};

const InputField: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    icon: React.ReactNode;
    type?: string;
    maxLength?: number;
}> = ({ value, onChange, placeholder, icon, type = "text", maxLength }) => (
     <div>
        <label htmlFor={placeholder} className="sr-only">{placeholder}</label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none">{icon}</div>
            <input
                type={type}
                id={placeholder}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                maxLength={maxLength}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm"
            />
        </div>
    </div>
);
