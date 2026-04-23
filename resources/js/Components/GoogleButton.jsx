import { FcGoogle } from 'react-icons/fc';

export default function GoogleButton({ className = '', children = 'Iniciar sesión con Google', ...props }) {
    return (
        <button
            {...props}
            className={`w-full flex items-center justify-center gap-3 rounded-lg border border-gray-200 
                       bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm 
                       transition-all duration-200 hover:bg-gray-50 hover:shadow-md 
                       focus:outline-none focus:ring-2 focus:ring-primary-sky-blue/50 ${className}`}
        >
            <FcGoogle className="h-5 w-5" />
            <span>{children}</span>
        </button>
    );
}