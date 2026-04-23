export default function InputLabel({ value, className = '', children, ...props }) {
    return (
        <label {...props} className={`block text-sm font-medium text-primary-slate ${className}`}>
            {value ? value : children}
        </label>
    );
}