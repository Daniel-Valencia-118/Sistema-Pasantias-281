// resources/js/Pages/Pasante/Actividades/Index.jsx
//  Componente Index (tarjetas)
import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import PasanteLayout from "@/Components/Layout/PasanteLayout";
import SkeletonCard from "@/Components/Common/SkeletonCard";
import { formatDateToSpanish } from "@/Utils/dateUtils";

export default function Index({ auth, tarjetas }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simular carga de datos (si ya vienen de Inertia, solo por efecto visual)
        setTimeout(() => setLoading(false), 300);
    }, []);

    const handleCardClick = (id) => {
        router.get(`/pasante/actividades/${id}`);
    };

    const getEstadoColor = (estado) => {
        if (estado === "iniciado") {
            return "bg-green-100 text-green-800";
        }
        return "bg-red-100 text-red-800";
    };

    const getEstadoTexto = (estado) => {
        return estado === "iniciado" ? "CURSANDO" : "FINALIZADO";
    };

    const formatRangoFechas = (fechaIni, fechaFin) => {
        if (!fechaIni || !fechaFin) return "";

        // Función auxiliar para crear la fecha local sin interferencia de UTC
        const crearFechaLocal = (fechaStr) => {
            const [year, month, day] = fechaStr.split("-").map(Number);
            return new Date(year, month - 1, day);
        };

        // Convertimos ambas fechas de forma segura
        const ini = crearFechaLocal(fechaIni);
        const fin = crearFechaLocal(fechaFin);

        const opciones = { day: "numeric", month: "long" };

        return `${ini.toLocaleDateString("es-ES", opciones)} - ${fin.toLocaleDateString("es-ES", opciones)}`;
    };

    return (
        <PasanteLayout auth={auth}>
            <Head title="Actividades" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary-navy">
                    Actividades
                </h1>
                <p className="text-gray-500">
                    Tus pasantías en curso y finalizadas
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : tarjetas.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                    <p className="text-gray-500">
                        No tienes pasantías activas o finalizadas.
                    </p>
                    <a
                        href="/pasante/inscribirse"
                        className="mt-2 inline-block text-primary-blue hover:underline"
                    >
                        Ver pasantías disponibles
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tarjetas.map((tarjeta) => (
                        <div
                            key={tarjeta.id}
                            onClick={() => handleCardClick(tarjeta.id)}
                            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group"
                        >
                            <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-5 py-4">
                                <h3 className="text-white font-bold text-lg truncate">
                                    {tarjeta.nombre}
                                </h3>
                                <p className="text-primary-sky-blue text-sm">
                                    {tarjeta.anio}
                                </p>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>
                                        📅{" "}
                                        {formatRangoFechas(
                                            tarjeta.fecha_ini,
                                            tarjeta.fecha_fin,
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Empresa
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {tarjeta.empresa_nombre}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Jefe
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {tarjeta.jefe_nombre}
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(tarjeta.estado_inscripcion)}`}
                                    >
                                        {getEstadoTexto(
                                            tarjeta.estado_inscripcion,
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 px-5 py-3 text-right text-primary-blue text-sm font-medium group-hover:bg-gray-50 transition">
                                Ver detalles →
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PasanteLayout>
    );
}
