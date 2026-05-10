import {
    LayoutDashboard,
    Users,
    UserCheck,
    Shield,
    Briefcase,
    UserCog,
    GraduationCap,
    School,
    Building2,
    ClipboardList,
    BookOpen,
    FileText,
    MessageSquare,
    Star,
    UserCircle,
    LogOut,
    Eye,
    UserPlus,
    Play,
    Bell,
    FilePlus,
    Activity,
    MessageCircle,
    BarChart3,
    FileCheck,
    Search,
} from 'lucide-react';

export const menuConfig = {
    admin: [
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            single: true,
            href: '/admin',
        },
        {
            name: 'Perfil',
            icon: UserCircle,
            submenus: [
                // { name: 'Ver Perfil', href: '/admin/perfil', icon: Eye },
                { name: 'Cerrar Sesión', action: 'logout', icon: LogOut },
            ],
        },
        {
            name: 'Gestión de Usuarios',
            icon: Users,
            submenus: [
                { name: 'Todos los Usuarios', href: '/admin/usuarios', icon: Users },
                { name: 'Solicitudes de usuario', href: '/admin/solicitudes', icon: UserCheck },
                { name: 'Administradores', href: '/admin/administradores', icon: Shield },
                { name: 'Gerentes', href: '/admin/gerentes', icon: Briefcase },
                { name: 'Jefes de Pasantía', href: '/admin/jefes', icon: UserCog },
                { name: 'Tutores Académicos', href: '/admin/tutores', icon: GraduationCap },
                { name: 'Pasantes', href: '/admin/pasantes', icon: School },
            ],
        },
        {
            name: 'Empresas',
            icon: Building2,
            single: true,
            href: '/admin/empresas',
        },
        {
            name: 'Programa de Pasantías',
            icon: ClipboardList,
            submenus: [
                { name: 'Ofertas Publicadas', href: '/admin/pasantias', icon: ClipboardList },
                { name: 'Crear Oferta', href: '/admin/pasantias/crear', icon: FilePlus },
            ],
        },
        {
            name: 'Monitoreo Académico',
            icon: BookOpen,
            submenus: [
                { name: 'Registro de Actividades', href: '/admin/actividades', icon: Activity },
                { name: 'Bitácoras de Evaluación', href: '/admin/bitacoras', icon: FileCheck },
                { name: 'Informes Finales', href: '/admin/informes', icon: FileText },
            ],
        },
        {
            name: 'Comunicación',
            icon: MessageSquare,
            submenus: [
                { name: 'Mensajes Internos', href: '/admin/mensajes', icon: MessageCircle },
                { name: 'Muro de Comentarios', href: '/admin/comentarios', icon: Star },
            ],
        },
    ],

    gerente: [
        {
            name: 'Perfil',
            icon: UserCircle,
            submenus: [
                { name: 'Ver Perfil', href: '/gerente/perfil', icon: Eye },
                { name: 'Cerrar Sesión', action: 'logout', icon: LogOut },
            ],
        },
        {
            name: 'Mi empresa',
            icon: Building2,
            single: true,
            href: '/gerente/empresa',
        },
        {
            name: 'Pasantías',
            icon: Briefcase,
            submenus: [
                { name: 'Publicar Pasantía', href: '/gerente/pasantias/crear', icon: FilePlus },
                { name: 'Pasantías Publicadas', href: '/gerente/pasantias', icon: ClipboardList },
                { name: 'Pasantías Activas', href: '/gerente/pasantias/activas', icon: Play },
            ],
        },
        {
            name: 'Jefe de Pasantes',
            icon: Users,
            submenus: [
                { name: 'Jefes de Pasantes', href: '/gerente/jefes', icon: Users },
                { name: 'Registrar jefe', href: '/gerente/jefes/crear', icon: UserPlus },
                { name: 'Solicitudes de registro', href: '/gerente/jefes/solicitudes', icon: ClipboardList },
            ],
        },
        {
            name: 'Pasantes',
            icon: School,
            single: true,
            href: '/gerente/pasantes',
        },
    ],

    jefe: [
        {
            name: 'Perfil',
            icon: UserCircle,
            submenus: [
                { name: 'Ver Perfil', href: '/jefe/perfil', icon: Eye },
                { name: 'Cerrar Sesión', action: 'logout', icon: LogOut },
            ],
        },
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            single: true,
            href: '/jefe',
        },
        {
            name: 'Mis Pasantías',
            icon: Briefcase,
            single: true,
            href: '/jefe/pasantias',
        },
        {
            name: 'Mis Pasantes',
            icon: School,
            single: true,
            href: '/jefe/pasantes',
        },
        {
            name: 'Evaluaciones',
            icon: FileCheck,
            submenus: [
                { name: 'Actividades', href: '/jefe/evaluaciones/subactividades', icon: Activity },
                { name: 'Bitácoras', href: '/jefe/evaluaciones/bitacoras', icon: FileCheck },
                { name: 'Nueva Bitácora', href: '/jefe/bitacora/crear', icon: FilePlus },
            ],
        },
                {
            name: 'Informes Finales',
            icon: FileText,
            submenus: [
                { name: 'Historial', href: '/jefe/informes/historial', icon: FileText },
                { name: 'Redactar Informe', href: '/jefe/informes/redactar', icon: FilePlus },
            ],
        },
        {
            name: 'Comunicación',
            icon: MessageCircle,
            submenus: [
                { name: 'Enviar Mensaje', href: '/jefe/comunicacion/crear-mensaje', icon: FilePlus },
                { name: 'Mensajes Enviados', href: '/jefe/comunicacion/mensajes-enviados', icon: MessageCircle },
            ],
        },
    ],

    tutor_aca: [
        {
            name: 'Perfil',
            icon: UserCircle,
            submenus: [
                { name: 'Ver Perfil', href: '/tutor/perfil', icon: Eye },
                { name: 'Cerrar Sesión', action: 'logout', icon: LogOut },
            ],
        },
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            single: true,
            href: '/tutor/dashboard',
        },
        {
            name: 'Mis Pasantes',
            icon: School,
            single: true,
            href: '/tutor/pasantes',
        },
        {
            name: 'Seguimiento',
            icon: BookOpen,
            submenus: [
                { name: 'Bitácoras', href: '/tutor/bitacoras', icon: FileCheck },
                { name: 'Informes Finales', href: '/tutor/informes', icon: FileText },
            ],
        },
    ],

    pasante: [
        {
            name: 'Perfil',
            icon: UserCircle,
            submenus: [
                { name: 'Ver Perfil', href: '/pasante/perfil', icon: Eye },
                { name: 'Cerrar Sesión', action: 'logout', icon: LogOut },
            ],
        },
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            single: true,
            href: '/pasante/dashboard',
        },
        {
            name: 'Pasantías',
            icon: Briefcase,
            submenus: [
                { name: 'Ver Disponibles', href: '/pasante/pasantias', icon: Eye },
                { name: 'Buscar Pasantías', href: '/pasante/pasantias/buscar', icon: Search },
            ],
        },
        {
            name: 'Mis Inscripciones',
            icon: FileCheck,
            single: true,
            href: '/pasante/inscripciones',
        },
        {
            name: 'Mi Bitácora',
            icon: BookOpen,
            single: true,
            href: '/pasante/bitacora',
        },
        {
            name: 'Mensajes',
            icon: MessageCircle,
            single: true,
            href: '/pasante/mensajes',
        },
        {
            name: 'Informes Finales',
            icon: FileText,
            single: true,
            href: '/pasante/informes',
        },
    ],
};
