import React from 'react';

export default function Select({ id, value, onChange, children, className = '', required = false, ...props }) {
    return (
        <div className="relative w-full group">
            <select
                id={id}
                value={value}
                onChange={onChange}
                required={required}
                className={`w-full appearance-none rounded-lg border-2 border-slate-200 bg-white pl-4 pr-10 py-2.5 
                    text-sm font-medium text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300
                    hover:border-blue-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]
                    focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 focus:outline-none ${className}`}
                {...props}
            >
                {children}
            </select>
            {/* Flecha personalizada que reacciona al pasar el cursor */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 group-hover:text-blue-500 transition-colors duration-300">
                <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
        </div>
    );
}
