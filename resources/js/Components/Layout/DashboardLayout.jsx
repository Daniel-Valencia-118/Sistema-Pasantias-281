import React, { useState } from "react";
import Sidebar from "@/Components/Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children, auth }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar para escritorio (siempre visible) */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                {/* Mandamos 'auth' completo al Sidebar igual que en GerenteLayout */}
                <Sidebar auth={auth} />
            </div>

            {/* Sidebar para móvil (overlay) */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    {/* Overlay de fondo */}
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />

                    {/* Contenedor del Sidebar móvil */}
                    <div className="relative flex h-full w-64 max-w-xs">
                        <Sidebar
                            auth={auth}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header móvil con botón para abrir sidebar */}
                <div className="lg:hidden bg-white shadow-sm p-4 flex items-center">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-primary-slate"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-3 font-semibold text-lg">SGP</span>
                </div>

                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
