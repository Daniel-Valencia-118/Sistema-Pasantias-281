export default function InputLabel({ value, className = '', children, ...props }) {
    return (
        <label 
            {...props} 
            className={`block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 transition-colors duration-200 select-none ${className}`}
        >
            {value ? value : children}
        </label>
    );
}
