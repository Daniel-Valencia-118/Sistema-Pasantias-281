import React, { forwardRef } from 'react';

const TextArea = forwardRef(({ className = '', isFocused = false, ...props }, ref) => {
    return (
        <textarea
            {...props}
            ref={ref}
            className={
                `w-full rounded-xl border border-slate-200 bg-white px-4 py-3 
                text-slate-700 placeholder-slate-400/80 shadow-sm/50 resize-none
                transition-all duration-200 ease-in-out
                focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 
                focus:outline-none disabled:bg-slate-50 disabled:text-slate-400
                ${className}`
            }
        />
    );
});

TextArea.displayName = 'TextArea';
export default TextArea;
