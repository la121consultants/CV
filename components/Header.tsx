
import React from 'react';
import { LogOut, Shield, FileText, UserCircle, Crown } from 'lucide-react';
import type { LoggedInUser } from '../types';

interface HeaderProps {
  loggedInUser: LoggedInUser | null;
  onLogout: () => void;
  onNavigateToHome: () => void;
  onNavigateToUserLogin: () => void;
  onNavigateToAdmin: () => void;
  onUpgradeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  loggedInUser, 
  onLogout, 
  onNavigateToHome,
  onNavigateToUserLogin,
  onNavigateToAdmin,
  onUpgradeClick
}) => {
  return (
    <header className="bg-dark shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <button onClick={onNavigateToHome} className="flex items-center space-x-3 group">
           <FileText className="h-8 w-8 text-secondary group-hover:text-orange-300 transition-colors" />
           <span className="text-white font-bold text-xl tracking-tight group-hover:text-gray-200 transition-colors">LA121 AI CV Review</span>
        </button>
        
        <div className="flex items-center space-x-4">
          {loggedInUser ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-white font-semibold text-sm">{loggedInUser.email}</p>
                <p className="text-blue-300 text-xs capitalize">{loggedInUser.role} User</p>
              </div>
              {loggedInUser.role === 'superadmin' && (
                <button
                  onClick={onNavigateToAdmin}
                  className="inline-flex items-center px-3 py-1.5 bg-yellow-500 text-white font-bold text-xs rounded-full shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-200"
                  title="Admin Panel"
                >
                  <Shield className="mr-1.5 h-4 w-4" />
                  Admin Panel
                </button>
              )}
              <button
                  onClick={onLogout}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white font-bold text-xs rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
                  title="Logout"
                >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
                <button
                    onClick={onUpgradeClick}
                    className="inline-flex items-center px-4 py-2 bg-secondary text-white font-bold text-sm rounded-full shadow-lg hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-200"
                >
                    <Crown className="mr-2 h-5 w-5" />
                    Upgrade to Pro
                </button>
                <button
                    onClick={onNavigateToUserLogin}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white font-bold text-sm rounded-full shadow-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
                >
                    <UserCircle className="mr-2 h-5 w-5" />
                    User Login
                </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
