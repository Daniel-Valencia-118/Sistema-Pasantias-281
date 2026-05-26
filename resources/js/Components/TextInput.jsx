import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';

const TextInput = forwardRef(({ type = 'text', className = '', isFocused = false, ...props }, ref) => {
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => inputRef.current);

    useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            ref={inputRef}
            className={`w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 
                text-sm font-medium text-slate-800 placeholder-slate-400/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300
                hover:border-blue-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]
                focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 focus:outline-none ${className}`}
        />
    );
});

TextInput.displayName = 'TextInput';
export default TextInput;
