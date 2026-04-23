export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                `rounded border-gray-300 text-primary-blue shadow-sm 
                focus:ring-primary-sky-blue/20 focus:ring-offset-0 
                transition duration-150 ${className}`
            }
        />
    );
}