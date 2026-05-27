// resources/js/Pages/Pasante/Actividades/Index.jsx
// Componente Index (tarjetas)
import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import PasanteLayout from "@/Components/Layout/PasanteLayout";
import SkeletonCard from "@/Components/Common/SkeletonCard";
import { formatDateToSpanish } from "@/Utils/dateUtils";
import {
    Briefcase,
    Calendar,
    Building2,
    User,
    ChevronRight,
    Clock,
    Award,
    TrendingUp,
    Search,
    Filter,
} from "lucide-react";

export default function Index({ auth, tarjetas }) {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState("todos");

    useEffect(() => {
        // Simular carga de datos (si ya vienen de Inertia, solo por efecto visual)
        setTimeout(() => setLoading(false), 300);
    }, []);

    const handleCardClick = (id) => {
        router.get(`/pasante/actividades/${id}`);
    };

    const getEstadoColor = (estado) => {
        if (estado === "iniciado") {
            return "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md";
        }
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md";
    };

    const getEstadoTexto = (estado) => {
        return estado === "iniciado" ? "CURSANDO" : "FINALIZADO";
    };

    const getEstadoIcon = (estado) => {
        return estado === "iniciado" ? (
            <TrendingUp size={14} />
        ) : (
            <Award size={14} />
        );
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

    // Filtrar tarjetas
    const filteredTarjetas = tarjetas.filter((tarjeta) => {
        const matchesSearch = tarjeta.nombre
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterEstado === "todos" ||
            tarjeta.estado_inscripcion === filterEstado;
        return matchesSearch && matchesFilter;
    });

    // Estadísticas
    const totalPasantias = tarjetas.length;
    const cursando = tarjetas.filter(
        (t) => t.estado_inscripcion === "iniciado",
    ).length;
    const finalizadas = tarjetas.filter(
        (t) => t.estado_inscripcion !== "iniciado",
    ).length;

    return (
        <PasanteLayout auth={auth}>
            <Head title="Actividades" />

            <div className="mb-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary-navy via-primary-slate to-gray-800 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-24 translate-y-24"></div>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-primary-sky-blue/10 to-transparent rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Briefcase size={28} />
                            </div>
                            <h1 className="text-3xl font-bold">
                                Gestion de Actividades
                            </h1>
                        </div>
                        <p className="text-white/80 text-lg mb-6">
                            Selecciona una pasantía para gestionar sus
                            actividades
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : filteredTarjetas.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    {tarjetas.length === 0 ? (
                        <>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No tienes pasantías
                            </h3>
                            <p className="text-gray-500 mb-4">
                                No tienes pasantías cursando o finalizadas.
                            </p>
                            <a
                                href="/pasante/inscribirse"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-sky-blue text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                            >
                                Ver pasantías disponibles
                                <ChevronRight size={18} />
                            </a>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No hay resultados
                            </h3>
                            <p className="text-gray-500">
                                No se encontraron pasantías que coincidan con tu
                                búsqueda.
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTarjetas.map((tarjeta) => (
                            <div
                                key={tarjeta.id}
                                onClick={() => handleCardClick(tarjeta.id)}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden transform hover:-translate-y-1"
                            >
                                {/* Card Header with gradient based on state */}
                                <div
                                    className={`p-5 ${
                                        tarjeta.estado_inscripcion ===
                                        "iniciado"
                                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                            : "bg-gradient-to-r from-gray-700 to-gray-800"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-bold text-base break-words mb-2">
                                                {tarjeta.nombre}
                                            </h3>
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                                                <Calendar
                                                    size={14}
                                                    className="text-white/80"
                                                />
                                                <span className="text-white/90 text-sm font-medium">
                                                    {tarjeta.anio}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white`}
                                        >
                                            {getEstadoIcon(
                                                tarjeta.estado_inscripcion,
                                            )}
                                            {getEstadoTexto(
                                                tarjeta.estado_inscripcion,
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Fechas */}
                                    <div className="flex items-start gap-2 text-sm">
                                        <Calendar
                                            size={16}
                                            className="text-primary-blue mt-0.5 flex-shrink-0"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Fecha Inicio y Final
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {formatRangoFechas(
                                                    tarjeta.fecha_ini,
                                                    tarjeta.fecha_fin,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Empresa */}
                                    <div className="flex items-start gap-2">
                                        <Building2
                                            size={16}
                                            className="text-primary-blue mt-0.5 flex-shrink-0"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Empresa
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {tarjeta.empresa_nombre}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Jefe */}
                                    <div className="flex items-start gap-2">
                                        <User
                                            size={16}
                                            className="text-primary-blue mt-0.5 flex-shrink-0"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Jefe Asignado
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {tarjeta.jefe_nombre}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between text-primary-blue text-sm font-medium group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-cyan-50 transition-all duration-200">
                                    <span>Ver detalles de actividades</span>
                                    <ChevronRight
                                        size={16}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </PasanteLayout>
    );
}
