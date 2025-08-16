import React from 'react';

interface ProgressBarProps {
  steps: number;
  currentStep: number;
  currentText: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep, currentText }) => {
  const progressPercentage = Math.max(0, (currentStep / steps) * 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-8 dark:bg-gray-700 mb-8 overflow-hidden relative border border-gray-300 shadow-inner">
      <div
        className="bg-blue-600 h-8 rounded-full transition-all duration-500 ease-out flex items-center justify-center"
        style={{ width: `${progressPercentage}%` }}
      >
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
         <span className="font-bold text-gray-800 drop-shadow-sm text-sm px-4">
          {currentText} ({currentStep}/{steps})
        </span>
      </div>
    </div>
  );
};
