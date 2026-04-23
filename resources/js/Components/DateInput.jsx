import React, { forwardRef } from 'react';

const DateInput = forwardRef(({ className = '', ...props }, ref) => {
    return (
        <input
            type="date"
            {...props}
            ref={ref}
            className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 
                        shadow-sm transition-all duration-200 focus:border-primary-blue 
                        focus:ring-2 focus:ring-primary-sky-blue/20 focus:outline-none ${className}`}
        />
    );
});

DateInput.displayName = 'DateInput';
export default DateInput;