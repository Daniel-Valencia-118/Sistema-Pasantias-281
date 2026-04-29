import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Shield,
    Briefcase,
    Bell,
    UserCog,
    GraduationCap,
    School,
    Building2,
    ClipboardList,
    BookOpen,
    FileText,
    MessageSquare,
    Star,
    ChevronDown,
    ChevronRight,
    Settings,
    LogOut,
    X
} from 'lucide-react';

const menuConfig = {
    administrador: [
        {
            title: 'DASHBOARD',
            items: [
                { label: 'Resumen Estadístico', route: 'admin.dashboard', icon: LayoutDashboard },
                { label: 'Alertas del Sistema', route: 'admin.alertas', icon: Bell },
            ]
        },
        {
            title: 'GESTIÓN DE USUARIOS',
            items: [
                { label: 'Todos los Usuarios', route: 'admin.usuarios.index', icon: Users },
                { label: 'Solicitudes de usuario', route: 'admin.solicitudes.index', icon: UserCheck },
                { label: 'Administradores', route: 'admin.administradores.index', icon: Shield },
                { label: 'Gerentes', route: 'admin.gerentes.index', icon: Briefcase },
                { label: 'Jefes de Pasantía', route: 'admin.jefes.index', icon: UserCog },
                { label: 'Tutores Académicos', route: 'admin.tutores.index', icon: GraduationCap },
                { label: 'Pasantes', route: 'admin.pasantes.index', icon: School },
            ]
        },
        {
            title: 'EMPRESAS',
            items: [
                { label: 'Todas las empresas', route: 'admin.empresas.index', icon: Building2 },
            ]
        },
        {
            title: 'PROGRAMA DE PASANTÍAS',
            items: [
                { label: 'Ofertas Publicadas', route: 'admin.pasantias.index', icon: ClipboardList },
            ]
        },
        {
            title: 'MONITOREO ACADÉMICO',
            items: [
                { label: 'Registro de Actividades', route: 'admin.actividades.index', icon: BookOpen },
                { label: 'Bitácoras de Evaluación', route: 'admin.bitacoras.index', icon: FileText },
                { label: 'Informes Finales', route: 'admin.informes.index', icon: FileText },
            ]
        },
        {
            title: 'COMUNICACIÓN',
            items: [
                { label: 'Mensajes Internos', route: 'admin.mensajes.index', icon: MessageSquare },
                { label: 'Muro de Comentarios', route: 'admin.comentarios.index', icon: Star },
            ]
        }
    ],
    // Puedes agregar configuraciones para otros roles aquí
    gerente: [
        { title: 'DASHBOARD', items: [
            { label: 'Resumen', route: 'gerente.dashboard', icon: LayoutDashboard }
        ]},
        // ... más según endpoints
    ],
    // ...
};

export default function Sidebar({ user, onClose }) {
    const { url } = usePage();
    const role = user?.rol || 'administrador';
    const menu = menuConfig[role] || [];

    const isActive = (routeName) => {
        return url.startsWith(route(routeName, [], false));
    };

    const [expandedUser, setExpandedUser] = useState(false);

    const handleLogout = () => {
        document.getElementById('logout-form').submit();
    };

    return (
        <div className="flex flex-col h-full w-72 bg-white border-r border-gray-200 shadow-sm">
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <ApplicationLogo showText={true} />
                </div>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* BODY - Navegación */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-8">
                {menu.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                            {section.title}
                        </h3>
                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                const active = isActive(item.route);
                                const Icon = item.icon;
                                return (
                                    <li key={item.route}>
                                        <Link
                                            href={route(item.route)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                                ${active
                                                    ? 'bg-primary-blue/10 text-primary-blue'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-navy'
                                                }`}
                                        >
                                            {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* FOOTER - Usuario */}
            <div className="border-t border-gray-100 p-4">
                <div className="relative">
                    <button
                        onClick={() => setExpandedUser(!expandedUser)}
                        className="flex items-center w-full gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="h-9 w-9 rounded-full bg-primary-blue flex items-center justify-center text-white font-semibold text-sm">
                            {(user?.nombre?.charAt(0) || '') + (user?.ap_paterno?.charAt(0) || '')}
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-700 truncate">
                                {user?.nombre} {user?.ap_paterno}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{user?.correo}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>

                    {expandedUser && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                            >
                                <Settings className="h-4 w-4" />
                                Configuración
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
                <form id="logout-form" method="POST" action={route('logout')} className="hidden">
                    <input type="hidden" name="_token" value={usePage().props.csrf_token} />
                </form>
            </div>
        </div>
    );
}