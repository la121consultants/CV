
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { LogIn, UserPlus, AlertCircle, Mail, Key } from 'lucide-react';
import type { LoggedInUser } from '../types';

interface AdminAuthProps {
    onLoginSuccess: (user: LoggedInUser) => void;
}

// StoredUser includes password, LoggedInUser does not.
interface StoredAdminUser extends LoggedInUser {
    password?: string;
}

const ADMIN_STORAGE_KEY = 'la121AdminAccount';
// This constant is now internal and not displayed in the UI.
const SUPER_ADMIN_EMAIL = 'admin@la121consultants.co.uk';

export const AdminAuth: React.FC<AdminAuthProps> = ({ onLoginSuccess }) => {
    const [isRegistered, setIsRegistered] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const adminAccountRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
            setIsRegistered(!!adminAccountRaw);
        } catch {
            setError("Could not read admin data from local storage.");
            setIsRegistered(false);
        }
    }, []);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
            setError('Registration is only permitted for the designated administrator email.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const adminAccount: StoredAdminUser = {
            email: email.toLowerCase(),
            password: password,
            role: 'superadmin',
            createdAt: new Date().toISOString(),
        };

        try {
            localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminAccount));
            const { password: _, ...userToLogin } = adminAccount;
            onLoginSuccess(userToLogin);
        } catch {
            setError('Failed to save admin account. Local storage may be full or disabled.');
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        const adminAccountRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (!adminAccountRaw) {
            setError('Admin account not found. Please complete the one-time registration.');
            setIsRegistered(false);
            return;
        }

        try {
            const adminAccount: StoredAdminUser = JSON.parse(adminAccountRaw);
            if (adminAccount.email?.toLowerCase() === email.toLowerCase() && adminAccount.password === password) {
                const { password: _, ...userToLogin } = adminAccount;
                onLoginSuccess(userToLogin);
            } else {
                setError('Invalid email or password.');
            }
        } catch {
            setError('Failed to read admin account. Data may be corrupted.');
        }
    };

    return (
        <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
               {isRegistered ? 'Admin Login' : 'Admin Registration'}
            </h1>
            <p className="text-center text-gray-500 mb-8">
               {isRegistered ? 'Enter your administrator credentials to access the panel.' : 'Secure the application by setting the administrator password.'}
            </p>
            
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 p-3 rounded-lg flex items-center text-sm mb-4">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0"/>
                    <span>{error}</span>
                </div>
            )}
            
            <form onSubmit={isRegistered ? handleLogin : handleRegister} className="space-y-4">
                <InputField type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin Email" icon={<Mail />} />
                <InputField type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isRegistered ? "Password" : "Choose a Password"} icon={<Key />} />
                {!isRegistered && (
                     <InputField type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" icon={<Key />} />
                )}
                <div className="pt-2">
                     <Button type="submit" className="w-full">
                        {isRegistered ? <><LogIn className="mr-2 h-5 w-5" /> Login</> : <><UserPlus className="mr-2 h-5 w-5" /> Register Admin Account</>}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const InputField: React.FC<{
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    icon: React.ReactNode;
    type?: string;
    readOnly?: boolean;
}> = ({ value, onChange, placeholder, icon, type = "text", readOnly = false }) => (
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
                readOnly={readOnly}
                autoComplete={type === 'password' ? 'current-password' : 'email'}
                className={`w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
        </div>
    </div>
);
