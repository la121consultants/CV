import React from 'react';
import { UserDataDownloader } from './UserDataDownloader';
import { UserManager } from './AdminManager';
import type { LoggedInUser } from '../types';
import { FeedbackViewer } from './FeedbackViewer';

interface AdminPanelProps {
    loggedInUser: LoggedInUser;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ loggedInUser }) => {
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            </div>

            <div className="space-y-6">
                <div className="p-6 rounded-lg border border-gray-200">
                   <h2 className="text-xl font-bold text-gray-800 mb-4">User Management</h2>
                   <UserManager loggedInUserEmail={loggedInUser.email} />
                </div>
                
                <div className="p-6 rounded-lg border border-gray-200">
                   <h2 className="text-xl font-bold text-gray-800 mb-4">Candidate Submission Data</h2>
                   <UserDataDownloader />
                </div>

                <div className="p-6 rounded-lg border border-gray-200">
                   <h2 className="text-xl font-bold text-gray-800 mb-4">Latest User Feedback</h2>
                   <FeedbackViewer />
                </div>
            </div>
        </div>
    );
};
