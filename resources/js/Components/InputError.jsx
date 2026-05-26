export default function InputError({ message, className = '' }) {
    return message ? (
        <p 
            className={`flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 mt-1.5 animate-fade-in ${className}`}
        >
            <svg 
                className="w-3.5 h-3.5 shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{message}</span>
        </p>
    ) : null;
}
