import React from 'react';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-md p-6 md:p-8
        ${hover ? 'hover:shadow-xl transition-shadow duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}