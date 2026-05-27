// resources/js/Config/menuPasante.js
import {
    Home,
    UserCircle,
    LogOut,
    Eye,
    Settings,
    FileText,
    ClipboardList,
    CheckCircle,
    Calendar,
    Mail,
    Bell,
} from "lucide-react";

export const menuPasante = [
    {
        name: "Home",
        icon: Home,
        href: "/pasante",
        hide: true,
        single: true,
    },
    {
        name: "Perfil",
        icon: UserCircle,
        hide: true,
        submenus: [
            { name: "Perfil", href: "/pasante/perfil", icon: Eye },
            { name: "Cuenta", href: "/pasante/cuenta", icon: Settings },
            { name: "Cerrar Sesión", action: "logout", icon: LogOut },
        ],
    },
    {
        name: "Inscribirse a Pasantía",
        icon: FileText,
        href: "/pasante/inscribirse",
        single: true,
    },
    {
        name: "Mis inscripciones",
        icon: ClipboardList,
        submenus: [
            {
                name: "Pasantías Inscritas",
                href: "/pasante/inscripciones/activas",
                icon: ClipboardList,
            },
            {
                name: "Inscripciones Finalizadas",
                href: "/pasante/inscripciones/finalizadas",
                icon: CheckCircle,
            },
        ],
    },
    {
        name: "Actividades",
        icon: Calendar,
        href: "/pasante/actividades",
        hide: true,
        single: true,
    },
    {
        name: "Mensajes",
        icon: Mail,
        href: "/pasante/mensajes",
        single: true,
    },
];
