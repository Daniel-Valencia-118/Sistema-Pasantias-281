import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';

const TextArea = forwardRef(({ className = '', isFocused = false, rows = 4, ...props }, ref) => {
    const textareaRef = useRef(null);

    useImperativeHandle(ref, () => textareaRef.current);

    useEffect(() => {
        if (isFocused && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isFocused]);

    return (
        <textarea
            {...props}
            ref={textareaRef}
            rows={rows}
            className={`w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 
                text-sm font-medium text-slate-800 placeholder-slate-400/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] resize-y min-h-[90px]
                transition-all duration-300 ease-in-out
                hover:border-blue-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]
                focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 focus:outline-none 
                disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none
                ${className}`}
        />
    );
});

TextArea.displayName = 'TextArea';
export default TextArea;
