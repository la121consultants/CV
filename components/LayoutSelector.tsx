
import React from 'react';
import type { LayoutType } from './CvDisplay';
import { Layout, Rows3, Columns } from 'lucide-react';

interface LayoutSelectorProps {
  selectedLayout: LayoutType;
  onSelectLayout: (layout: LayoutType) => void;
}

const layoutOptions: { name: LayoutType; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    name: 'modern', 
    label: 'Modern', 
    icon: <Columns className="h-6 w-6" />,
    description: 'A stylish two-column design.'
  },
  { 
    name: 'classic', 
    label: 'Classic', 
    icon: <Rows3 className="h-6 w-6" />,
    description: 'A clean, traditional format.'
  },
  { 
    name: 'compact', 
    label: 'Compact', 
    icon: <Layout className="h-6 w-6" />,
    description: 'A space-efficient layout.'
  },
];

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({ selectedLayout, onSelectLayout }) => {
  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose Layout</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {layoutOptions.map((option) => (
          <button
            key={option.name}
            onClick={() => onSelectLayout(option.name)}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center space-x-4 ${
              selectedLayout === option.name
                ? 'bg-primary-light border-primary shadow-md'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${selectedLayout === option.name ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                {option.icon}
            </div>
            <div>
                 <p className="font-bold text-gray-800">{option.label}</p>
                 <p className="text-xs text-gray-500">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
