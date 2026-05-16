import {
    UserCircle,
    LogOut,
    Eye,
    Building2,
    Briefcase,
    FileText,
    ClipboardList,
    Play,
    CheckCircle,
    Users,
    UserPlus,
    Home,
    Bell,
    BarChart3,
    Settings,
} from "lucide-react";

export const menuGerente = [
    {
        name: "Home",
        icon: Home,
        href: "/gerente",
        single: true,
    },
    {
        name: "Perfil",
        icon: UserCircle,
        hide: true,
        submenus: [
            { name: "Perfil", href: "/gerente/perfil", icon: Eye },
            { name: "Cuenta", href: "/gerente/cuenta", icon: Settings },
            { name: "Cerrar Sesión", action: "logout", icon: LogOut },
        ],
    },
    {
        name: "Mi Empresa",
        icon: Building2,
        href: "/gerente/empresa",
        single: true,
    },
    {
        name: "Pasantías",
        icon: Briefcase,
        submenus: [
            {
                name: "Pasantías Iniciadas",
                href: "/gerente/pasantias/activas",
                icon: Play,
            },
            {
                name: "Pasantías Publicadas",
                href: "/gerente/pasantias",
                icon: ClipboardList,
            },
            {
                name: "Publicar Pasantía",
                href: "/gerente/pasantias/crear",
                icon: FileText,
            },
            {
                name: "Pasantías Finalizadas",
                href: "/gerente/pasantias/finalizadas",
                icon: CheckCircle,
            },
        ],
    },
    {
        name: "Jefe de Pasantes",
        icon: Users,
        submenus: [
            { name: "Jefes de Pasantes", href: "/gerente/jefes", icon: Users },
            {
                name: "Registrar Jefe",
                href: "/gerente/jefes/crear",
                icon: UserPlus,
            },
            {
                name: "Solicitudes de Registro",
                href: "/gerente/jefes/solicitudes",
                icon: ClipboardList,
            },
        ],
    },
    {
        name: "Estadísticas",
        icon: BarChart3,
        href: "/gerente/estadisticas",
        single: true,
    },
];
