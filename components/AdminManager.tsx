
import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Trash2, Mail, Key, Star, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import type { LoggedInUser } from '../types';

interface UserManagerProps {
    loggedInUserEmail: string;
}

// Represents the full user object as stored in localStorage, including password.
interface StoredUser extends LoggedInUser {
    password?: string;
}

const USER_STORAGE_KEY = 'la121Users';

export const UserManager: React.FC<UserManagerProps> = ({ loggedInUserEmail }) => {
    const [users, setUsers] = useState<StoredUser[]>([]);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<'pro' | 'onetime'>('onetime');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const getUsers = (): StoredUser[] => {
        try {
            const usersRaw = localStorage.getItem(USER_STORAGE_KEY);
            return usersRaw ? JSON.parse(usersRaw) : [];
        } catch {
            return [];
        }
    };

    const saveUsers = (updatedUsers: StoredUser[]) => {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
    };

    useEffect(() => {
        setUsers(getUsers());
    }, []);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!newUserEmail || !newUserPassword) {
            setError('Please provide both an email and a password.');
            return;
        }
        if (newUserPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        const currentUsers = getUsers();
        if (currentUsers.find(user => user.email.toLowerCase() === newUserEmail.toLowerCase())) {
            setError('A user with this email already exists.');
            return;
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const newUser: StoredUser = {
            email: newUserEmail.toLowerCase(),
            password: newUserPassword,
            role: newUserRole,
            createdAt: new Date().toISOString(),
            expiresAt: expiryDate.toISOString(),
            usageCount: newUserRole === 'onetime' ? 0 : undefined,
        };

        const updatedUsers = [...currentUsers, newUser];
        saveUsers(updatedUsers);
        
        setSuccess(`User ${newUserEmail} created as a ${newUserRole} user.`);
        setNewUserEmail('');
        setNewUserPassword('');
        setTimeout(() => setSuccess(null), 5000);
    };

    const handleRemoveUser = (emailToRemove: string) => {
        if (window.confirm(`Are you sure you want to remove the user account for ${emailToRemove}? This action cannot be undone.`)) {
            const currentUsers = getUsers();
            const updatedUsers = currentUsers.filter(user => user.email.toLowerCase() !== emailToRemove.toLowerCase());
            saveUsers(updatedUsers);
            setSuccess(`User ${emailToRemove} has been removed.`);
            setTimeout(() => setSuccess(null), 3000);
        }
    };
    
    const getUserStatus = (user: StoredUser): { text: string; color: string; icon: React.ReactNode } => {
        if (user.role === 'superadmin') return { text: 'Active', color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" /> };
        
        const isExpired = user.expiresAt && new Date(user.expiresAt) < new Date();
        if (isExpired) return { text: 'Expired', color: 'text-red-600', icon: <XCircle className="h-4 w-4" /> };
        
        if (user.role === 'onetime') {
            if ((user.usageCount || 0) >= 1) {
                return { text: 'Used', color: 'text-yellow-600', icon: <AlertCircle className="h-4 w-4" /> };
            }
        }
        
        return { text: 'Active', color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" /> };
    };

    const managedUsers = useMemo(() => users.filter(u => u.role !== 'superadmin'), [users]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Create New User</h3>
                <form onSubmit={handleAddUser} className="p-4 bg-gray-50 rounded-lg border space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative">
                             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                             <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="New User Email" className="w-full pl-10 p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="relative">
                             <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="Set Password" className="w-full pl-10 p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                        <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as 'pro' | 'onetime')} className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="onetime">One-Time Use (1 CV, expires in 30 days)</option>
                            <option value="pro">Pro User (Unlimited, expires in 30 days)</option>
                        </select>
                    </div>
                     {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                     {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
                    <div className="text-right pt-2">
                        <Button type="submit" className="px-4 py-2 text-sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create User
                        </Button>
                    </div>
                </form>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Users ({managedUsers.length})</h3>
                <div className="border rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires On</th>
                          <th scope="col" className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {managedUsers.length === 0 ? (
                           <tr><td colSpan={5} className="p-4 text-center text-gray-500">No users have been created yet.</td></tr> 
                        ) : (
                           managedUsers.map(user => {
                                const status = getUserStatus(user);
                                return (
                                    <tr key={user.email}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{user.email}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 capitalize">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'pro' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                               {user.role === 'pro' ? <Star className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                               {user.role}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${status.color}`}>
                                            <div className="flex items-center">{status.icon} <span className="ml-1.5">{status.text}</span></div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleRemoveUser(user.email)} className="text-red-500 hover:text-red-700" title={`Delete ${user.email}`}>
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                           })
                        )}
                      </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
