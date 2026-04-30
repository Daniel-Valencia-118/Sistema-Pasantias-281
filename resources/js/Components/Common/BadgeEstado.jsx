import React from "react";

const estadoConfig = {
    // Estados de cuenta
    activo: { bg: "bg-green-100", text: "text-green-800", label: "Activo" },
    inactivo: { bg: "bg-red-100", text: "text-red-800", label: "Inactivo" },

    // Estados de pasantía
    ABIERTA: { bg: "bg-green-100", text: "text-green-800", label: "Abierta" },
    INICIADO: { bg: "bg-blue-100", text: "text-blue-800", label: "Iniciado" },
    FINALIZADO: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Finalizado",
    },
    CANCELADO: { bg: "bg-red-100", text: "text-red-800", label: "Cancelado" },

    // Estados de aprobación
    aprobado: { bg: "bg-green-100", text: "text-green-800", label: "Aprobado" },
    pendiente: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pendiente",
    },
    rechazado: { bg: "bg-red-100", text: "text-red-800", label: "Rechazado" },
};

export default function BadgeEstado({ estado, customLabel }) {
    const config = estadoConfig[estado] || estadoConfig.activo;

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
        >
            {customLabel || config.label}
        </span>
    );
}
