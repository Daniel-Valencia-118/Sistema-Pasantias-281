import { Link } from '@inertiajs/react';

export default function SecondaryButton({ href, className = '', children, ...props }) {
    const classes = `inline-flex items-center justify-center rounded-lg border-2 border-primary-slate 
                     bg-transparent px-6 py-3 text-sm font-semibold text-primary-slate 
                     shadow-sm transition-all duration-200 hover:bg-primary-slate/5 
                     focus:outline-none focus:ring-2 focus:ring-primary-sky-blue/50 ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button {...props} className={classes}>
            {children}
        </button>
    );
}