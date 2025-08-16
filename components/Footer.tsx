import React from 'react';
import type { LoggedInUser } from '../types';

interface FooterProps {
    loggedInUser: LoggedInUser | null;
    onNavigateToAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ loggedInUser, onNavigateToAdminLogin }) => {
  return (
    <footer className="bg-white mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} LA121 AI CV Review. All Rights Reserved.</p>
        
        {!loggedInUser && (
            <div className="mt-3">
                <button onClick={onNavigateToAdminLogin} className="text-sm text-gray-600 hover:text-primary font-medium transition-colors">
                    Admin Login
                </button>
            </div>
        )}
        
        <div className="text-sm mt-2">
             <p>For any technical problems, please email <a href="mailto:admin@la121consultants.co.uk" className="text-primary hover:underline font-medium">admin@la121consultants.co.uk</a>.</p>
        </div>
      </div>
    </footer>
  );
};
