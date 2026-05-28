import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Toast from '@/Components/Toast';
import NotificationDropdown from '@/Components/NotificationDropdown'; // <-- Importamos el módulo
import ApplicationLogo from "@/Components/ApplicationLogo";
import { 
    Menu, Home, User, Settings, LogOut, ChevronLeft 
} from 'lucide-react';

export default function DashboardLayout({ children, auth, header }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Lógica de datos de usuario
    const user = auth?.user;
    const nombreCompleto = user?.nombre || 'Usuario';
    const primeraLetra = nombreCompleto.charAt(0).toUpperCase();
    const rolFormateado = user?.rol?.replace('_', ' ') || 'Invitado';
    

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* 1. SIDEBAR DESKTOP */}
            <div className="hidden lg:flex lg:flex-shrink-0 border-r border-gray-200 relative z-40">
                <Sidebar auth={auth} />
            </div>

            {/* 2. SIDEBAR MÓVIL (OVERLAY) */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
                        onClick={() => setSidebarOpen(false)} 
                    />
                    <div className="relative flex h-full w-64 max-w-xs flex-col bg-primary-navy shadow-xl">
                        <Sidebar 
                            auth={auth} 
                            onClose={() => setSidebarOpen(false)} 
                        />
                    </div>
                </div>
            )}

            {/* 3. AREA DE CONTENIDO PRINCIPAL */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* HEADER */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        
                        <div className="lg:hidden flex items-center gap-2">
                           <ApplicationLogo className="transform scale-70" showText={false} />
                        </div>

                        {/* Título dinámico */}
                        {/* <div className="hidden sm:block">
                            {header ? (
                                <h1 className="text-xl font-bold text-gray-800">{header}</h1>
                            ) : (
                                <h1 className="text-xl font-bold text-gray-800">Sistema de Gestión</h1>
                            )}
                        </div> */}
                    </div>

                    <div className="flex-1" />

                    {/* Derecha: íconos y menú de usuario */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={route(`${user?.rol}.dashboard`)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            title="Inicio"
                        >
                            <Home size={20} />
                        </Link>

                        {/* ¡MÓDULO DE NOTIFICACIONES REUTILIZABLE E INTEGRADO! */}
                        <NotificationDropdown />

                        {/* Menú de usuario */}
                        <div className="relative user-menu">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                            >
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky-blue flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                                        {auth.user?.avatar_url ? (
                                            <img
                                                src={auth.user.avatar_url}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{primeraLetra}</span>
                                        )}
                                    </div>
                                <span className="hidden md:block text-sm font-medium text-gray-700">
                                    {nombreCompleto.split(" ")[0]}
                                </span>
                                <ChevronLeft
                                    size={14}
                                    className={`hidden md:block text-gray-400 transition-transform duration-200 ${userMenuOpen ? "-rotate-90" : "rotate-0"}`}
                                />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky-blue flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                                                {auth.user?.avatar_url ? (
                                                    <img
                                                        src={
                                                            auth.user.avatar_url
                                                        }
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{primeraLetra}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {nombreCompleto}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate lowercase">
                                                    {user?.email || `${user?.nombre_user}@sgp.com`}
                                                </p>
                                                <p className="text-[10px] font-bold text-primary-blue mt-1 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded w-fit">
                                                    {rolFormateado}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                            
                                                href={route(`${user?.rol}.perfil`)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User size={16} className="text-gray-400" />
                                                Mi Perfil
                                            </Link>
                                            {/* Si es admin mostrar configuración si no no mostrar nada*/}
                                            {user?.rol === 'admin' && (
                                                <Link
                                                    href={route('admin.configuracion.edit')}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Settings size={16} className="text-gray-400" />
                                                    Configuración
                                                </Link>
                                            )}
                                            {/* <Link
                                                // Si es admin llevar a configuracion, si es otro rol llevar a perfil
                                                href={user?.rol === 'admin' ? route('admin.configuracion') : route(`${user?.rol}.perfil`)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings size={16} className="text-gray-400" />
                                                {user?.rol === 'admin' ? 'Configuración' : 'Cuenta'}
                                            </Link> */}
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                            >
                                                <LogOut size={16} />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* CONTENIDO DE LA PÁGINA */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            
            <Toast />
        </div>
    );
}