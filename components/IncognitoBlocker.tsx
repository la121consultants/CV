
import React from 'react';
import { ShieldOff, Crown } from 'lucide-react';

interface IncognitoBlockerProps {
  onUpgradeClick: () => void;
}

export const IncognitoBlocker: React.FC<IncognitoBlockerProps> = ({ onUpgradeClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 text-center w-full">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg w-full border-2 border-primary">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-light mb-6">
            <ShieldOff className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Private Mode Requires Pro</h1>
        <p className="text-gray-700 leading-relaxed mb-8">
          To ensure fair usage, the free version of our tool is not available in private windows. Pro users enjoy unrestricted access in any browser mode.
        </p>
        
        <button
            onClick={onUpgradeClick}
            className="w-full inline-flex items-center justify-center px-6 py-4 bg-secondary text-white font-bold text-lg rounded-lg shadow-lg hover:bg-secondary-hover focus:outline-none focus:ring-4 focus:ring-orange-300 transform hover:-translate-y-0.5 transition-all duration-200"
        >
            <Crown className="mr-3 h-6 w-6" />
            Upgrade to Pro
        </button>

        <p className="text-sm text-gray-500 mt-6">
          Alternatively, you can switch to a regular browser window to continue with the free version.
        </p>
      </div>
    </div>
  );
};
