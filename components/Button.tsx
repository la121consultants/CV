
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold text-lg rounded-full shadow-lg hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
    >
      {children}
    </button>
  );
};
