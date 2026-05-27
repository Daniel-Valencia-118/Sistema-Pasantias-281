import React, { useState, useMemo } from "react";
import axios from "axios";
import { Head, router } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";

import ModalActividadesPasantia from "@/Components/Common/ModalActividadesPasantia";
import ModalPasantesPromedio from "@/Components/Common/ModalPasantesPromedio";
import ModalCalificaciones from "@/Components/Common/ModalCalificaciones";
import ModalHorario from "@/Components/Common/ModalHorario";
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
    ChevronRight,
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
    const [modalHorario, setModalHorario] = useState({
        isOpen: false,
        turno: null,
        cargaHoraria: null,
        fechaIni: null,
        fechaFin: null,
        detalleHorario: null,
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

    const formatFechaBolivia = (fechaStr) => {
        if (!fechaStr) return "";
        const soloFecha = fechaStr.toString().slice(0, 10);
        const [anio, mes, dia] = soloFecha.split("-").map(Number);
        return new Date(anio, mes - 1, dia).toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
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
                                            <div className="flex items-center gap-4 text-sm">
                                                {/* Sección Fecha de Inicio */}
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 bg-green-100 rounded-lg">
                                                        <Calendar
                                                            size={15}
                                                            className="text-green-600"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-green-700 font-medium">
                                                            {formatFechaBolivia(
                                                                pasantia.fecha_ini,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Línea divisoria vertical | */}
                                                <div className="h-7 w-[3px] bg-gray-200" />

                                                {/* Sección Fecha de Fin */}
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 bg-red-100 rounded-lg">
                                                        <Calendar
                                                            size={15}
                                                            className="text-red-600"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-red-700 font-medium">
                                                            {formatFechaBolivia(
                                                                pasantia.fecha_fin,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats - Botón de pasantes mejorado */}
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
                                                    className="flex flex-col items-start gap-1 p-2 bg-secondary-teal/5 border border-secondary-teal/30 rounded-lg hover:bg-secondary-teal/15 hover:border-secondary-teal transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md w-full text-left group/btn"
                                                    title="Ver pasantes, actividades y notas finales"
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        <div className="p-1 bg-secondary-teal/15 rounded-lg group-hover/btn:bg-secondary-teal/25 transition-colors">
                                                            <Users
                                                                size={14}
                                                                className="text-secondary-teal"
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold text-blue-800">
                                                            {pasantia.inscritos}{" "}
                                                            PASANTES
                                                        </span>
                                                        <ChevronRight
                                                            size={14}
                                                            className="ml-auto text-secondary-teal/40 group-hover/btn:text-secondary-teal group-hover/btn:translate-x-0.5 transition-all opacity-0 group-hover/btn:opacity-100"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 pl-7">
                                                        <span className="flex text-xs  items-center gap-1">
                                                            <FileText
                                                                size={13}
                                                            />{" "}
                                                            Actividades
                                                        </span>
                                                        <span className="flex text-xs items-center gap-1">
                                                            <FileText
                                                                size={13}
                                                            />{" "}
                                                            Nota final
                                                        </span>
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Calificaciones - Botón mejorado */}
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
                                                className="w-full bg-primary-sky-blue/5 border border-primary-sky-blue/30 hover:bg-primary-sky-blue/15 hover:border-primary-sky-blue rounded-xl p-3 transition-all duration-200 cursor-pointer group text-left shadow-sm hover:shadow-md"
                                                title="Ver calificaciones detalladas"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide group-hover:text-primary-sky-blue transition-colors">
                                                        Calificaciones
                                                    </span>
                                                    <span className="text-sm text-gray-500 group-hover:text-primary-sky-blue transition-colors">
                                                        {
                                                            pasantia.total_calificaciones
                                                        }{" "}
                                                        opiniones
                                                        <ChevronRight
                                                            size={12}
                                                            className="inline ml-1 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
                                                        />
                                                    </span>
                                                </div>
                                                <div className="hover:opacity-80 transition-opacity">
                                                    {renderStars(
                                                        pasantia.promedio_calificaciones,
                                                    )}
                                                </div>
                                            </button>

                                            {/* Botones de acción - Mejorados */}
                                            <div className="grid grid-cols-3 gap-3 pt-2">
                                                <button
                                                    onClick={() =>
                                                        setModalHorario({
                                                            isOpen: true,
                                                            turno: pasantia.turno,
                                                            cargaHoraria:
                                                                pasantia.carga_horaria,
                                                            fechaIni:
                                                                pasantia.fecha_ini,
                                                            fechaFin:
                                                                pasantia.fecha_fin,
                                                            detalleHorario:
                                                                pasantia.detalles_horario,
                                                        })
                                                    }
                                                    className="flex flex-col items-center gap-1.5 p-2 bg-primary-sky-blue/10 border border-primary-sky-blue/30 rounded-lg hover:bg-primary-sky-blue/20 hover:border-primary-sky-blue transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                                                    title="Ver detalles"
                                                >
                                                    <Eye
                                                        size={18}
                                                        className="text-primary-sky-blue"
                                                    />
                                                    <span className="text-[12px] font-medium text-primary-sky-blue">
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
                                                    className="flex flex-col items-center gap-1.5 p-2 bg-primary-sky-blue/10 border border-primary-sky-blue/30 rounded-lg hover:bg-primary-sky-blue/20 hover:border-primary-sky-blue transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                                                    title="Ver actividades"
                                                >
                                                    <FileText
                                                        size={18}
                                                        className="text-primary-sky-blue"
                                                    />
                                                    <span className="text-[12px] font-medium text-primary-sky-blue">
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
                                                    className="flex flex-col items-center gap-1.5 p-2 bg-primary-blue border border-primary-blue rounded-lg hover:bg-primary-sky-blue transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg group/btn"
                                                    title="Abrir pasantía nuevamente"
                                                >
                                                    <RefreshCw
                                                        size={18}
                                                        className="text-white"
                                                    />
                                                    <span className="text-[12px] font-semibold text-white">
                                                        Reabrir
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
            <ModalHorario
                isOpen={modalHorario.isOpen}
                onClose={() =>
                    setModalHorario({
                        isOpen: false,
                        turno: null,
                        cargaHoraria: null,
                        fechaIni: null,
                        fechaFin: null,
                        detalleHorario: null,
                    })
                }
                turno={modalHorario.turno}
                cargaHoraria={modalHorario.cargaHoraria}
                fechaIni={modalHorario.fechaIni}
                fechaFin={modalHorario.fechaFin}
                detalleHorario={modalHorario.detalleHorario}
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
