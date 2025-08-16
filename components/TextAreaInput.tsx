
import React from 'react';

interface TextAreaInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  isInvalid?: boolean;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({ id, value, onChange, placeholder, rows = 10, isInvalid = false }) => {
  return (
    <div className="w-full">
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-4 border rounded-lg shadow-sm focus:ring-2 transition duration-150 ease-in-out bg-white text-gray-800 placeholder-gray-400 mt-2 ${
            isInvalid ? 'border-red-500 ring-red-300 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
        }`}
      />
    </div>
  );
};
