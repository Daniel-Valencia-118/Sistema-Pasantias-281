// resources/js/Pages/Pasante/Inscripciones/Activas.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PasanteLayout from "@/Components/Layout/PasanteLayout";
import ModalDetallesEmpresa from "@/Components/Common/ModalDetallesEmpresa";
import ModalHorario from "@/Components/Common/ModalHorario";
import ModalActividadesPasante from "@/Components/Common/ModalActividadesPasante";
import ModalCompaneros from "@/Components/Common/ModalCompaneros";
import {
    Building2,
    Calendar as CalendarIcon,
    Clock,
    Users,
    UserCheck,
    Eye,
    PlayCircle,
    CheckCircle,
    AlertCircle,
    Search,
    Briefcase,
    TrendingUp,
} from "lucide-react";

export default function Activas({ auth, inscripciones }) {
    const [modales, setModales] = useState({
        empresa: { isOpen: false, empresa: null },
        horario: {
            isOpen: false,
            turno: null,
            cargaHoraria: null,
            fechaIni: null,
            fechaFin: null,
        },
        actividades: { isOpen: false, nombre: null, actividades: [] },
        companeros: { isOpen: false, pasantiaId: null, pasantiaNombre: null },
    });

    console.log(inscripciones);
    
    const [searchTerm, setSearchTerm] = useState("");
    const bandera1 = 1;

    const getEstadoBadge = (estado) => {
        if (estado === "inscrito") {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                    <Clock size={12} />
                    POR INICIAR
                </span>
            );
        }
        if (estado === "iniciado") {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md">
                    <PlayCircle size={12} />
                    CURSANDO
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md">
                <AlertCircle size={12} />
                {estado}
            </span>
        );
    };

    const filteredInscripciones = inscripciones.filter((inscripcion) =>
        inscripcion.pasantia.nombre
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
    );

    // Estadísticas
    const totalActivas = inscripciones.length;
    const cursando = inscripciones.filter(
        (i) => i.estado_inscripcion === "iniciado",
    ).length;
    const porIniciar = inscripciones.filter(
        (i) => i.estado_inscripcion === "inscrito",
    ).length;

    return (
        <PasanteLayout auth={auth}>
            <Head title="Mis Inscripciones - Pasantías Inscritas" />

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
                                Pasantías Activas
                            </h1>
                        </div>
                        <p className="text-white/80 text-lg mb-6">
                            Gestiona y da seguimiento a tus pasantías en curso
                        </p>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-sm">
                                            Total Inscripciones
                                        </p>
                                        <p className="text-2xl font-bold mt-1">
                                            {totalActivas}
                                        </p>
                                    </div>
                                    <Briefcase
                                        size={32}
                                        className="text-blue-300"
                                    />
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-sm">
                                            En Curso
                                        </p>
                                        <p className="text-2xl font-bold mt-1">
                                            {cursando}
                                        </p>
                                    </div>
                                    <PlayCircle
                                        size={32}
                                        className="text-green-300"
                                    />
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-sm">
                                            Por Iniciar
                                        </p>
                                        <p className="text-2xl font-bold mt-1">
                                            {porIniciar}
                                        </p>
                                    </div>
                                    <Clock
                                        size={32}
                                        className="text-yellow-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards Grid View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredInscripciones.map((inscripcion, index) => {
                    const p = inscripcion.pasantia;
                    return (
                        <div
                            key={inscripcion.id_inscripcion}
                            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-blue/20 transform hover:-translate-y-1"
                        >
                            {/* Card Header */}
                            <div
                                className={`p-4 border-b ${
                                    inscripcion.estado_inscripcion ===
                                    "iniciado"
                                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
                                        : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className="font-bold text-base text-gray-800 break-words flex-1 min-w-0">
                                        {p.nombre}
                                    </h3>
                                    <div className="flex-shrink-0">
                                        {getEstadoBadge(
                                            inscripcion.estado_inscripcion,
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <button
                                        onClick={() =>
                                            setModales({
                                                ...modales,
                                                empresa: {
                                                    isOpen: true,
                                                    empresa: p.empresa,
                                                },
                                            })
                                        }
                                        className="flex items-center gap-2 flex-1 min-w-0 text-left hover:bg-primary-blue/5 rounded-lg p-1 -ml-1 transition-colors group"
                                        title="Ver detalles de la empresa"
                                    >
                                        <Building2
                                            size={16}
                                            className="text-primary-blue flex-shrink-0"
                                        />
                                        <span className="text-gray-700 font-medium break-words flex-1 min-w-0 group-hover:text-primary-blue transition-colors">
                                            {p.empresa.nombre}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-3">
                                {/* Actividades & Horario */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() =>
                                            router.visit(
                                                `/pasante/actividades/${p.id}`,
                                            )
                                        }
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-blue to-primary-sky-blue text-white rounded-lg hover:from-primary-sky-blue hover:to-primary-blue transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                                        title="Ver actividades"
                                    >
                                        <CalendarIcon size={16} />
                                        Actividades
                                    </button>
                                    <button
                                        onClick={() =>
                                            setModales({
                                                ...modales,
                                                horario: {
                                                    isOpen: true,
                                                    turno: p.turno,
                                                    cargaHoraria:
                                                        p.carga_horaria,
                                                    fechaIni: p.fecha_ini,
                                                    fechaFin: p.fecha_fin,
                                                },
                                            })
                                        }
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                                        title="Ver horario"
                                    >
                                        <Clock size={16} />
                                        Hrs. y Fechas
                                    </button>
                                </div>

                                {/* Jefe Asignado */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <UserCheck
                                            size={16}
                                            className="text-green-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Jefe Asignado
                                        </span>
                                    </div>
                                    {inscripcion.jefe_asignado ? (
                                        <span className="text-sm font-semibold text-gray-900">
                                            {
                                                inscripcion.jefe_asignado
                                                    .ap_paterno
                                            }{" "}
                                            {
                                                inscripcion.jefe_asignado
                                                    .ap_materno
                                            }{" "}
                                            {inscripcion.jefe_asignado.nombre}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">
                                            No Asignado
                                        </span>
                                    )}
                                </div>

                                {/* Inscritos */}
                                <button
                                    onClick={() =>
                                        setModales({
                                            ...modales,
                                            companeros: {
                                                isOpen: true,
                                                pasantiaId: p.id,
                                                pasantiaNombre: p.nombre,
                                            },
                                        })
                                    }
                                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 group"
                                    title="Ver compañeros inscritos"
                                >
                                    <div className="flex items-center gap-2">
                                        <Users
                                            size={18}
                                            className="text-purple-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Compañeros inscritos
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-purple-700">
                                            {p.total_inscritos}
                                        </span>
                                        <span className="text-purple-600 group-hover:translate-x-1 transition-transform">
                                            →
                                        </span>
                                    </div>
                                </button>

                                {/* Progress Indicator for "Cursando" */}
                                {/* {inscripcion.estado_inscripcion ===
                                    "iniciado" && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Progreso</span>
                                            <span>En desarrollo</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-2/3 animate-pulse"></div>
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredInscripciones.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    {inscripciones.length === 0 ? (
                        <>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No hay inscripciones
                            </h3>
                            <p className="text-gray-500 mb-4">
                                No estás inscrito en ninguna pasantía
                                actualmente.
                            </p>
                            <a
                                href="/pasante/inscribirse"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-sky-blue text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                            >
                                Ver pasantías disponibles
                                <TrendingUp size={18} />
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
            )}

            {/* Modales */}
            <ModalDetallesEmpresa
                isOpen={modales.empresa.isOpen}
                onClose={() =>
                    setModales({
                        ...modales,
                        empresa: { isOpen: false, empresa: null },
                    })
                }
                empresa={modales.empresa.empresa}
            />

            <ModalHorario
                isOpen={modales.horario.isOpen}
                onClose={() =>
                    setModales({
                        ...modales,
                        horario: {
                            isOpen: false,
                            turno: null,
                            cargaHoraria: null,
                            fechaIni: null,
                            fechaFin: null,
                        },
                    })
                }
                turno={modales.horario.turno}
                cargaHoraria={modales.horario.cargaHoraria}
                fechaIni={modales.horario.fechaIni}
                fechaFin={modales.horario.fechaFin}
            />

            <ModalActividadesPasante
                isOpen={modales.actividades.isOpen}
                onClose={() =>
                    setModales({
                        ...modales,
                        actividades: {
                            isOpen: false,
                            nombre: null,
                            actividades: [],
                        },
                    })
                }
                pasantiaNombre={modales.actividades.nombre}
                actividades={modales.actividades.actividades}
                var1={bandera1}
            />

            <ModalCompaneros
                isOpen={modales.companeros.isOpen}
                onClose={() =>
                    setModales({
                        ...modales,
                        companeros: {
                            isOpen: false,
                            pasantiaId: null,
                            pasantiaNombre: null,
                        },
                    })
                }
                pasantiaId={modales.companeros.pasantiaId}
                pasantiaNombre={modales.companeros.pasantiaNombre}
            />
        </PasanteLayout>
    );
}
