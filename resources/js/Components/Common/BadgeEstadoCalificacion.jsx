import React from "react";
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    Clock,
    HelpCircle,
} from "lucide-react";

const estadoConfig = {
    COMPLETADA: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
        label: "Completada",
    },
    "COMPLETADA PARCIALMENTE": {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: AlertTriangle,
        label: "Completada Parcialmente",
    },
    "NO REALIZADA": {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: XCircle,
        label: "No Realizada",
    },
    "SIN CALIFICAR": {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
        label: "Sin Calificar",
    },
    PENDIENTE: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        icon: HelpCircle,
        label: "Pendiente",
    },
};

export default function BadgeEstadoCalificacion({ estado }) {
    const config = estadoConfig[estado] || estadoConfig["PENDIENTE"];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
        >
            <Icon size={12} />
            {config.label}
        </span>
    );
}
