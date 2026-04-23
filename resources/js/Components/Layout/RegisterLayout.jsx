import React from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function RegisterLayout({ children, title }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-sky-50/20">
            <header className="w-full py-6 px-6 md:px-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <ApplicationLogo showText={true} />
                    <a 
                        href={route('welcome')} 
                        className="text-sm text-primary-slate hover:text-primary-blue transition"
                    >
                        ← Volver al inicio
                    </a>
                </div>
            </header>
            <main className="py-8 px-6">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
            <footer className="py-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Sistema de Gestión de Pasantías. Todos los derechos reservados.
            </footer>
        </div>
    );
}