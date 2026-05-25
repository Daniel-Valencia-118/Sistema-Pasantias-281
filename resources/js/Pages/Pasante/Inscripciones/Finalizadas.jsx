// resources/js/Pages/Pasante/Inscripciones/Finalizadas.jsx
import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import PasanteLayout from "@/Components/Layout/PasanteLayout";
import ModalDetallesEmpresa from "@/Components/Common/ModalDetallesEmpresa";
import ModalHorario from "@/Components/Common/ModalHorario";
import ModalDetallePromedio from "@/Components/Common/ModalDetallePromedio";
import ModalCalificarPasantia from "@/Components/Common/ModalCalificarPasantia";
import BadgeFecha from "@/Components/Common/BadgeFecha";

import {
    Building2,
    Clock,
    Eye,
    Star,
    FileText,
    Calendar as CalendarIcon,
    Search,
    Award,
    TrendingUp,
    CheckCircle,
    XCircle,
    Info,
} from "lucide-react";

export default function Finalizadas({ auth, inscripciones }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [modalEmpresa, setModalEmpresa] = useState({
        isOpen: false,
        empresa: null,
    });
    const [modalHorario, setModalHorario] = useState({
        isOpen: false,
        turno: null,
        cargaHoraria: null,
        fechaIni: null,
        fechaFin: null,
        detalleHorario: null,
    });
    const [modalDetallePromedio, setModalDetallePromedio] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });
    const [modalCalificar, setModalCalificar] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
        yaCalifico: false,
        calificacionExistente: null,
    });

    const getPromedioColor = (promedio, abandono) => {
        if (abandono)
            return "bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md";
        if (promedio >= 80)
            return "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md";
        if (promedio >= 60)
            return "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-md";
        if (promedio >= 40)
            return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md";
        return "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md";
    };

    const getPromedioIcon = (promedio, abandono) => {
        if (abandono) return <XCircle size={16} className="mr-1" />;
        if (promedio >= 80) return <Award size={16} className="mr-1" />;
        if (promedio >= 60) return <TrendingUp size={16} className="mr-1" />;
        if (promedio >= 40) return <Info size={16} className="mr-1" />;
        return <XCircle size={16} className="mr-1" />;
    };

    const abrirModalCalificar = (inscripcion) => {
        setModalCalificar({
            isOpen: true,
            pasantiaId: inscripcion.pasantia.id,
            pasantiaNombre: inscripcion.pasantia.nombre,
            yaCalifico: inscripcion.ya_califico,
            calificacionExistente: inscripcion.calificacion_existente,
        });
    };

    const filteredInscripciones = inscripciones.filter((ins) =>
        ins.pasantia.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Estadísticas rápidas
    const totalFinalizadas = inscripciones.length;
    const promedioGeneral =
        inscripciones
            .filter((i) => !i.abandono)
            .reduce((acc, i) => acc + i.promedio, 0) /
        (inscripciones.filter((i) => !i.abandono).length || 1);
    const totalAbandonos = inscripciones.filter((i) => i.abandono).length;

    return (
        <PasanteLayout auth={auth}>
            <Head title="Pasantías Finalizadas" />

            <div className="mb-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary-navy via-primary-slate to-gray-800 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-24 translate-y-24"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Award size={28} />
                            </div>
                            <h1 className="text-3xl font-bold">
                                Pasantías Finalizadas
                            </h1>
                        </div>
                        <p className="text-white/80 text-lg mb-6">
                            Historial completo de tus pasantías completadas
                        </p>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-sm">
                                            Total Pasantías
                                        </p>
                                        <p className="text-2xl font-bold mt-1">
                                            {totalFinalizadas}
                                        </p>
                                    </div>
                                    <CheckCircle
                                        size={32}
                                        className="text-green-300"
                                    />
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-sm">
                                            Promedio General
                                        </p>
                                        <p className="text-2xl font-bold mt-1">
                                            {promedioGeneral.toFixed(1)}/100
                                        </p>
                                    </div>
                                    <TrendingUp
                                        size={32}
                                        className="text-blue-300"
                                    />
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-sm">
                                            Abandonos
                                        </p>
                                        <p className="text-2xl font-bold mt-1">
                                            {totalAbandonos}
                                        </p>
                                    </div>
                                    <XCircle
                                        size={32}
                                        className="text-red-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Buscar pasantía por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all duration-200 bg-white shadow-sm"
                    />
                </div>
            </div>

            {/* Cards Grid View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredInscripciones.map((ins, idx) => {
                    const p = ins.pasantia;
                    const promedio = ins.promedio;
                    const abandono = ins.abandono;
                    return (
                        <div
                            key={ins.id_inscripcion}
                            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-blue/20"
                        >
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className="font-bold text-base text-gray-800 break-words flex-1 min-w-0">
                                        {p.nombre}
                                    </h3>
                                    <span className="flex-shrink-0 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full shadow-sm">
                                        FINALIZADO
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <button
                                        onClick={() =>
                                            setModalEmpresa({
                                                isOpen: true,
                                                empresa: p.empresa,
                                            })
                                        }
                                        className="flex items-center gap-2 flex-1 min-w-0 text-left hover:bg-primary-blue/5 rounded-lg p-1 -ml-1 transition-colors group"
                                        title="Ver detalles empresa"
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
                                {/* Horario */}
                                <button
                                    onClick={() =>
                                        setModalHorario({
                                            isOpen: true,
                                            turno: p.turno,
                                            cargaHoraria: p.carga_horaria,
                                            fechaIni: p.fecha_ini,
                                            fechaFin: p.fecha_fin,
                                            detalleHorario: p.detalles_horario,
                                        })
                                    }
                                    className="w-full flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors group"
                                    title="Ver horario y fechas completas"
                                >
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock
                                            size={18}
                                            className="text-primary-blue"
                                        />
                                        <span>Hrs. y Fechas</span>
                                    </div>
                                    <div className="text-primary-blue group-hover:text-primary-sky-blue font-medium flex items-center gap-1">
                                        {p.fecha_fin?.substring(0, 4)}
                                    </div>
                                </button>

                                {/* Promedio */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Award
                                            size={16}
                                            className="text-primary-blue"
                                        />
                                        <span>Promedio Actividades</span>
                                    </div>
                                    {abandono ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 shadow-sm">
                                            ABANDONO
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`px-3 py-1 rounded-full text-sm font-bold flex items-center ${getPromedioColor(promedio, false)}`}
                                            >
                                                {getPromedioIcon(
                                                    promedio,
                                                    false,
                                                )}
                                                {promedio}/100
                                            </div>
                                            <button
                                                onClick={() =>
                                                    setModalDetallePromedio({
                                                        isOpen: true,
                                                        pasantiaId: p.id,
                                                        pasantiaNombre:
                                                            p.nombre,
                                                    })
                                                }
                                                className="text-primary-blue hover:text-primary-sky-blue p-1 hover:bg-primary-blue/10 rounded-lg transition-colors"
                                                title="Ver detalle promedios"
                                            >
                                                <CalendarIcon size={16} />
                                                ver
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Informe Final */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FileText
                                            size={16}
                                            className="text-primary-blue"
                                        />
                                        <span className="text-sm">
                                            Informe Final
                                        </span>
                                    </div>
                                    {abandono ? (
                                        <span className="text-gray-400 text-xs italic">
                                            no disponible
                                        </span>
                                    ) : (
                                        <a
                                            href={route(
                                                "pasante.informe-final",
                                                { idPasantia: p.id },
                                            )}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            <FileText size={16} />
                                            GENERAR INFORME
                                        </a>
                                    )}
                                </div>

                                {/* Calificar Button */}
                                <div className="pt-2">
                                    <button
                                        onClick={() => abrirModalCalificar(ins)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-xl font-medium hover:from-yellow-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <Star size={18} />
                                        <span>
                                            {ins.ya_califico
                                                ? "Ver Calificación"
                                                : "Calificar Pasantía"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredInscripciones.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No hay resultados
                    </h3>
                    <p className="text-gray-500">
                        No tienes ninguna pasantía finalizada
                    </p>
                </div>
            )}

            {/* Modales */}
            <ModalDetallesEmpresa
                isOpen={modalEmpresa.isOpen}
                onClose={() =>
                    setModalEmpresa({ isOpen: false, empresa: null })
                }
                empresa={modalEmpresa.empresa}
            />

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

            <ModalDetallePromedio
                isOpen={modalDetallePromedio.isOpen}
                onClose={() =>
                    setModalDetallePromedio({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                    })
                }
                pasantiaId={modalDetallePromedio.pasantiaId}
                pasantiaNombre={modalDetallePromedio.pasantiaNombre}
            />

            <ModalCalificarPasantia
                isOpen={modalCalificar.isOpen}
                onClose={() =>
                    setModalCalificar({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                        yaCalifico: false,
                        calificacionExistente: null,
                    })
                }
                pasantiaId={modalCalificar.pasantiaId}
                pasantiaNombre={modalCalificar.pasantiaNombre}
                yaCalifico={modalCalificar.yaCalifico}
                calificacionExistente={modalCalificar.calificacionExistente}
            />
        </PasanteLayout>
    );
}
