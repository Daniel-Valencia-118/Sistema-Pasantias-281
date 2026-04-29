import React, { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Sidebar from '@/Components/Sidebar';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar para escritorio */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <Sidebar user={user} />
            </div>

            {/* Sidebar móvil (offcanvas) */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex h-full w-72 max-w-xs">
                        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Área de contenido principal */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header móvil con botón de menú */}
                <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="text-primary-slate">
                        <Menu className="h-6 w-6" />
                    </button>
                    <ApplicationLogo showText={true} className="scale-75" />
                </div>

                {/* Contenido de la página */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}