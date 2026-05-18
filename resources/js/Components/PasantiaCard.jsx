// resources/js/Components/PasantiaCard.jsx
import React from "react";

export default function PasantiaCard({ tarjeta, onClick }) {
    const getEstadoColor = (estado) => {
        if (estado === "INICIADO") return "bg-green-100 text-green-800";
        if (estado === "ABIERTA") return "bg-green-100 text-green-800";
        if (estado === "FINALIZADO") return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-800"; // Estado por defecto por si se expande el sistema
    };

    const getEstadoTexto = (estado) => {
        if (estado === "INICIADO") return "INICIADO";
        if (estado === "ABIERTA") return "ABIERTA";
        if (estado === "FINALIZADO") return "FINALIZADO";
        return estado ? estado.toUpperCase() : "DESCONOCIDO";
    };

    const formatRangoFechas = (fechaIni, fechaFin) => {
        const ini = new Date(fechaIni);
        const fin = new Date(fechaFin);
        const opciones = { day: "numeric", month: "long" };
        return `${ini.toLocaleDateString("es-ES", opciones)} - ${fin.toLocaleDateString("es-ES", opciones)}`;
    };

    return (
        <div
            onClick={() => onClick && onClick(tarjeta.id)}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group"
        >
            {/* Cabecera de la tarjeta */}
            <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-5 py-4">
                <h3 className="text-white font-bold text-lg truncate">
                    {tarjeta.nombre}
                </h3>
                <p className="text-primary-sky-blue text-sm">
                    {tarjeta.anio}
                </p>
            </div>

            {/* Cuerpo de la tarjeta */}
            <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>
                        📅 {formatRangoFechas(tarjeta.fecha_ini, tarjeta.fecha_fin)}
                    </span>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Empresa</p>
                    <p className="font-medium text-gray-800 truncate">
                        {tarjeta.empresa_nombre}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Jefe de Pasantía</p>
                    <p className="font-medium text-gray-800 truncate">
                        {tarjeta.jefe_nombre}
                    </p>
                </div>
                <div className="pt-2">
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(tarjeta.estado_inscripcion)}`}
                    >
                        {getEstadoTexto(tarjeta.estado_inscripcion)}
                    </span>
                </div>
            </div>

            {/* Footer de acción */}
            <div className="border-t border-gray-100 px-5 py-3 text-right text-primary-blue text-sm font-medium group-hover:bg-gray-50 transition">
                Ver detalles →
            </div>
        </div>
    );
}