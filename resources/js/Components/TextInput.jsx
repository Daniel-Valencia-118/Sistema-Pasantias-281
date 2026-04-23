import React, { forwardRef } from 'react';

const TextInput = forwardRef(({ type = 'text', className = '', isFocused = false, ...props }, ref) => {
    return (
        <input
            {...props}
            type={type}
            className={
                `w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 
                placeholder-gray-400 shadow-sm transition-all duration-200
                focus:border-primary-blue focus:ring-2 focus:ring-primary-sky-blue/20 
                focus:outline-none ${className}`
            }
            ref={ref}
        />
    );
});

TextInput.displayName = 'TextInput';
export default TextInput;