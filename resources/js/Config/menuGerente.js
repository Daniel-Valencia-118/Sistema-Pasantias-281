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
} from "lucide-react";

export const menuGerente = [
    {
        name: "Perfil",
        icon: UserCircle,
        submenus: [
            { name: "Ver Perfil", href: "/gerente/perfil", icon: Eye },
            { name: "Cerrar Sesión", action: "logout", icon: LogOut },
        ],
    },
    {
        name: "Mi empresa",
        icon: Building2,
        href: "/gerente/empresa",
        single: true,
    },
    {
        name: "Pasantías",
        icon: Briefcase,
        submenus: [
            {
                name: "Pasantías Activas",
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
                name: "Registrar jefe",
                href: "/gerente/jefes/crear",
                icon: UserPlus,
            },
            {
                name: "Solicitudes de registro",
                href: "/gerente/jefes/solicitudes",
                icon: ClipboardList,
            },
        ],
    },
];
