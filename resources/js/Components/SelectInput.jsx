import React, { forwardRef } from 'react';

const SelectInput = forwardRef(({ className = '', children, ...props }, ref) => {
    return (
        <select
            {...props}
            ref={ref}
            className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 
                        shadow-sm transition-all duration-200 focus:border-primary-blue 
                        focus:ring-2 focus:ring-primary-sky-blue/20 focus:outline-none ${className}`}
        >
            {children}
        </select>
    );
});

SelectInput.displayName = 'SelectInput';
export default SelectInput;