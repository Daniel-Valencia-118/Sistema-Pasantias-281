import React, { useState, useMemo } from "react";
import axios from "axios";
import { Head, router } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import ModalDetallesPasantia from "@/Components/Common/ModalDetallesPasantia";
import ModalActividadesPasantia from "@/Components/Common/ModalActividadesPasantia";
import ModalPasantesPromedio from "@/Components/Common/ModalPasantesPromedio";
import ModalCalificaciones from "@/Components/Common/ModalCalificaciones";
import ModalActividadesFinalizadas from "@/Components/Common/ModalActividadesFinalizadas";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import BadgeFecha from "@/Components/Common/BadgeFecha";
import {
    Lock,
    LockOpen,
    Eye,
    Calendar,
    Users,
    Star,
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    CheckCircle,
    Copy,
    Briefcase,
    Award,
    TrendingUp,
    Clock,
    FileText,
    Archive,
    RefreshCw,
} from "lucide-react";

export default function Finalizadas({ auth, pasantias }) {
    const [modalAbrir, setModalAbrir] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });
    const [loadingAbrir, setLoadingAbrir] = useState(false);
    const [pasantiasData, setPasantiasData] = useState(pasantias);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("fecha_ini");
    const [sortDirection, setSortDirection] = useState("desc");
    const [modalDetalles, setModalDetalles] = useState({
        isOpen: false,
        pasantia: null,
    });
    const [modalActividades, setModalActividades] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });
    const [modalPasantes, setModalPasantes] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });
    const [modalCalificaciones, setModalCalificaciones] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
        promedio: null,
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field)
            return <ArrowUpDown size={14} className="text-gray-400" />;
        return sortDirection === "asc" ? (
            <ChevronUp size={14} className="text-white" />
        ) : (
            <ChevronDown size={14} className="text-white" />
        );
    };

    const handleAbrirPasantia = async () => {
        setLoadingAbrir(true);
        try {
            const response = await axios.get(
                `/gerente/pasantias/finalizadas/${modalAbrir.pasantiaId}/clonar`,
            );

            sessionStorage.setItem(
                "pasantia_clonada",
                JSON.stringify({
                    pasantia: response.data.pasantia,
                    actividades: response.data.actividades,
                }),
            );

            router.visit("/gerente/pasantias/crear");
        } catch (error) {
            alert(
                error.response?.data?.message || "Error al abrir la pasantía",
            );
            setModalAbrir({
                isOpen: false,
                pasantiaId: null,
                pasantiaNombre: null,
            });
        } finally {
            setLoadingAbrir(false);
        }
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={14}
                    className={
                        i <= fullStars
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                    }
                />,
            );
        }
        return (
            <div className="flex items-center gap-0.5">
                {stars}
                <span className="ml-1 text-xs text-gray-500">({rating})</span>
            </div>
        );
    };

    const filteredAndSorted = useMemo(() => {
        let filtered = [...pasantiasData];

        if (searchTerm) {
            filtered = filtered.filter(
                (p) =>
                    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.mencion.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === "fecha_ini" || sortField === "fecha_fin") {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (typeof aVal === "string") {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [pasantiasData, searchTerm, sortField, sortDirection]);

    // Estadísticas
    const totalFinalizadas = pasantiasData.length;
    const totalPasantes = pasantiasData.reduce(
        (acc, p) => acc + (p.inscritos || 0),
        0,
    );
    const promedioGeneral =
        pasantiasData.reduce(
            (acc, p) => acc + (p.promedio_calificaciones || 0),
            0,
        ) / (totalFinalizadas || 1);

    return (
        <GerenteLayout auth={auth}>
            <Head title="Pasantías Finalizadas" />

            <div className="space-y-6">
                {/* Hero Section - Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-l-4 border-gray-500 shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">
                                    Total Finalizadas
                                </p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {totalFinalizadas}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-200 rounded-xl">
                                <Archive size={24} className="text-gray-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-500 shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">
                                    Total Pasantes
                                </p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {totalPasantes}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Users size={24} className="text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-l-4 border-yellow-500 shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">
                                    Promedio General
                                </p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {promedioGeneral.toFixed(1)}/5
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-xl">
                                <Star
                                    size={24}
                                    className="text-yellow-600 fill-yellow-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header y Búsqueda */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                    <Archive size={22} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">
                                        PASANTÍAS FINALIZADAS
                                    </h2>
                                    <p className="text-white/70 text-sm mt-0.5 flex items-center gap-1.5">
                                        <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                        Historial de pasantías completadas
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o mención..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 pr-4 py-2 w-72 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-none focus:border-white/40 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Grid de Tarjetas */}
                    <div className="p-6">
                        {filteredAndSorted.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <Search
                                        size={28}
                                        className="text-gray-400"
                                    />
                                </div>
                                <h3 className="text-base font-medium text-gray-700 mb-1">
                                    No hay resultados
                                </h3>
                                <p className="text-sm text-gray-500">
                                    No se encontraron pasantías finalizadas
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredAndSorted.map((pasantia, index) => (
                                    <div
                                        key={pasantia.id}
                                        className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300"
                                    >
                                        {/* Card Header */}
                                        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-bold text-base break-words">
                                                        {pasantia.nombre}
                                                    </h3>
                                                    <div className="mt-2">
                                                        <span className="inline-flex px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-primary-blue to-primary-sky-blue rounded-lg shadow-sm">
                                                            {pasantia.mencion}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 px-2.5 py-1 bg-white/10 rounded-lg">
                                                    <span className="text-white text-xs font-semibold">
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 space-y-4">
                                            {/* Fechas */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar
                                                        size={14}
                                                        className="text-gray-400"
                                                    />
                                                    <div>
                                                        <p className="text-xs text-gray-400">
                                                            Inicio
                                                        </p>
                                                        <BadgeFecha
                                                            fecha={
                                                                pasantia.fecha_ini
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar
                                                        size={14}
                                                        className="text-gray-400"
                                                    />
                                                    <div>
                                                        <p className="text-xs text-gray-400">
                                                            Fin
                                                        </p>
                                                        <BadgeFecha
                                                            fecha={
                                                                pasantia.fecha_fin
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                <button
                                                    onClick={() =>
                                                        setModalPasantes({
                                                            isOpen: true,
                                                            pasantiaId:
                                                                pasantia.id,
                                                            pasantiaNombre:
                                                                pasantia.nombre,
                                                        })
                                                    }
                                                    className="flex flex-col items-start gap-1 p-2 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors w-full text-left"
                                                    title="Ver pasantes, actividades y notas finales"
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Users
                                                            size={14}
                                                            className="text-primary-blue"
                                                        />
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            {pasantia.inscritos}{" "}
                                                            pasantes
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 pl-6">
                                                        <span className="flex items-center gap-1">
                                                            <FileText
                                                                size={10}
                                                            />{" "}
                                                            Actividades
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FileText
                                                                size={10}
                                                            />{" "}
                                                            Nota final
                                                        </span>
                                                    </div>
                                                </button>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <CheckCircle size={12} />
                                                    Finalizado
                                                </span>
                                            </div>

                                            {/* Calificaciones */}
                                            <button
                                                onClick={() =>
                                                    setModalCalificaciones({
                                                        isOpen: true,
                                                        pasantiaId: pasantia.id,
                                                        pasantiaNombre:
                                                            pasantia.nombre,
                                                        promedio:
                                                            pasantia.promedio_calificaciones,
                                                    })
                                                }
                                                className="w-full bg-gray-50 hover:bg-blue-50 rounded-xl p-3 transition-all duration-200 cursor-pointer group text-left"
                                                title="Ver calificaciones detalladas"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide group-hover:text-primary-blue transition-colors">
                                                        Calificaciones
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {
                                                            pasantia.total_calificaciones
                                                        }{" "}
                                                        opiniones
                                                    </span>
                                                </div>
                                                <div className="hover:opacity-80 transition-opacity">
                                                    {renderStars(
                                                        pasantia.promedio_calificaciones,
                                                    )}
                                                </div>
                                            </button>
                                            {/* Botones de acción */}
                                            <div className="grid grid-cols-3 gap-2 pt-2">
                                                <button
                                                    onClick={() =>
                                                        setModalDetalles({
                                                            isOpen: true,
                                                            pasantia: pasantia,
                                                        })
                                                    }
                                                    className="flex flex-col items-center gap-1 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye
                                                        size={16}
                                                        className="text-gray-500"
                                                    />
                                                    <span className="text-[10px] text-gray-500">
                                                        Detalles
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setModalActividades({
                                                            isOpen: true,
                                                            pasantiaId:
                                                                pasantia.id,
                                                            pasantiaNombre:
                                                                pasantia.nombre,
                                                        })
                                                    }
                                                    className="flex flex-col items-center gap-1 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Ver actividades"
                                                >
                                                    <FileText
                                                        size={16}
                                                        className="text-gray-500"
                                                    />
                                                    <span className="text-[10px] text-gray-500">
                                                        Actividades
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setModalAbrir({
                                                            isOpen: true,
                                                            pasantiaId:
                                                                pasantia.id,
                                                            pasantiaNombre:
                                                                pasantia.nombre,
                                                        })
                                                    }
                                                    className="flex flex-col items-center gap-1 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                                                    title="Abrir pasantía nuevamente"
                                                >
                                                    <LockOpen
                                                        size={16}
                                                        className="text-blue-600"
                                                    />
                                                    <span className="text-[10px] text-blue-700 font-medium">
                                                        Reabrir Pasantia
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modales - Sin cambios */}
            <ModalDetallesPasantia
                isOpen={modalDetalles.isOpen}
                onClose={() =>
                    setModalDetalles({ isOpen: false, pasantia: null })
                }
                pasantia={modalDetalles.pasantia}
            />

            <ModalPasantesPromedio
                isOpen={modalPasantes.isOpen}
                onClose={() =>
                    setModalPasantes({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                    })
                }
                pasantiaId={modalPasantes.pasantiaId}
                pasantiaNombre={modalPasantes.pasantiaNombre}
            />

            <ModalCalificaciones
                isOpen={modalCalificaciones.isOpen}
                onClose={() =>
                    setModalCalificaciones({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                        promedio: null,
                    })
                }
                pasantiaId={modalCalificaciones.pasantiaId}
                pasantiaNombre={modalCalificaciones.pasantiaNombre}
                promedio={modalCalificaciones.promedio}
            />

            <ModalConfirmacion
                isOpen={modalAbrir.isOpen}
                onClose={() =>
                    setModalAbrir({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                    })
                }
                onConfirm={handleAbrirPasantia}
                titulo="Abrir Pasantía"
                mensaje={`¿Deseas abrir nuevamente la pasantía "${modalAbrir.pasantiaNombre}"? Podrás editar detalles y fechas antes de publicarlo.`}
                type="info"
                confirmText="Abrir"
                loading={loadingAbrir}
            />

            <ModalActividadesFinalizadas
                isOpen={modalActividades.isOpen}
                onClose={() =>
                    setModalActividades({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                    })
                }
                pasantiaId={modalActividades.pasantiaId}
                pasantiaNombre={modalActividades.pasantiaNombre}
            />
        </GerenteLayout>
    );
}
