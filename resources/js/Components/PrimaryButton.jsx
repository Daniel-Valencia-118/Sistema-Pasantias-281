export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-lg bg-primary-blue px-6 py-3 text-sm font-semibold 
                text-white shadow-md transition-all duration-200 hover:bg-primary-slate 
                focus:outline-none focus:ring-2 focus:ring-primary-sky-blue/50 
                disabled:opacity-50 disabled:cursor-not-allowed ${className}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}