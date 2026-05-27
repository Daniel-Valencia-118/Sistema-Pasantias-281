import React from "react";
import { Calendar } from "lucide-react";
import { formatDateToSpanish } from "@/Utils/dateUtils";

export default function BadgeFecha({
    fecha,
    showIcon = false,
    className = "",
}) {
    if (!fecha) return <span className="text-gray-400">-</span>;

    // 1. Obtener el día de hoy a las 00:00:00 local
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 2. Crear fechaObj usando año, mes y día de forma manual para evitar desfases UTC
    // Asumiendo que 'fecha' viene como "YYYY-MM-DD" (ej: "2026-05-23")
    const partes = fecha.split("-");
    const anio = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // En JS los meses van de 0 a 11
    const dia = parseInt(partes[2], 10);

    const fechaObj = new Date(anio, mes, dia);
    fechaObj.setHours(0, 0, 0, 0);

    // 3. Determinar el color del Badge
    let bgColor = "bg-gray-100 text-gray-700";
    if (fechaObj < hoy) {
        bgColor = "bg-red-100 text-red-700"; // Pasado
    } else if (fechaObj.getTime() === hoy.getTime()) {
        bgColor = "bg-yellow-100 text-yellow-700"; // Hoy
    } else {
        bgColor = "bg-green-100 text-green-700"; // Futuro
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm border ${bgColor} ${className}`}
        >
            {showIcon && <Calendar size={12} className="text-current" />}
            {formatDateToSpanish(fecha)}
        </span>
    );
}
