import React from 'react';

export default function Select({ id, value, onChange, children, className = '', required = false, ...props }) {
    return (
        <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 
                shadow-sm transition-all duration-200
                focus:border-primary-blue focus:ring-2 focus:ring-primary-sky-blue/20 
                focus:outline-none ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}