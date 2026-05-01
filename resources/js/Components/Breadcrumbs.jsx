// resources/js/Components/Breadcrumbs.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items }) {
    // items: [{ label: 'Dashboard', url: 'admin.dashboard' }, { label: 'Usuarios' }]
    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link href={route('dashboard')} className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-primary-blue">
                        <Home className="w-4 h-4 mr-1" />
                        Inicio
                    </Link>
                </li>
                {items.map((item, idx) => (
                    <li key={idx}>
                        <div className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                            {item.url ? (
                                <Link href={route(item.url)} className="text-sm font-medium text-gray-400 hover:text-primary-blue">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-sm font-medium text-primary-navy">{item.label}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}