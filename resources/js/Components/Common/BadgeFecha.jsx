import React from "react";
import { Calendar } from "lucide-react";
import { formatDateToSpanish } from "@/Utils/dateUtils";

export default function BadgeFecha({ fecha, showIcon = true, className = "" }) {
    if (!fecha) return <span className="text-gray-400">-</span>;

    // Determinar si la fecha es pasada, actual o futura
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaObj = new Date(fecha);
    fechaObj.setHours(0, 0, 0, 0);

    let bgColor = "bg-gray-100 text-gray-700";
    if (fechaObj < hoy) {
        bgColor = "bg-red-100 text-red-700";
    } else if (fechaObj.getTime() === hoy.getTime()) {
        bgColor = "bg-yellow-100 text-yellow-700";
    } else {
        bgColor = "bg-green-100 text-green-700";
    }

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${className}`}
        >
            {showIcon && <Calendar size={12} />}
            {formatDateToSpanish(fecha)}
        </span>
    );
}
