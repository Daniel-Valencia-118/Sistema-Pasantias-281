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
import { Building2, Clock, Eye, Star, FileText } from "lucide-react";

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
        if (abandono) return "bg-orange-100 text-orange-800";
        if (promedio >= 80) return "bg-green-100 text-green-800";
        if (promedio >= 60) return "bg-blue-100 text-blue-800";
        if (promedio >= 40) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
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

    return (
        <PasanteLayout auth={auth}>
            <Head title="Pasantías Finalizadas" />

            <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-primary-navy">
                        Pasantías Finalizadas
                    </h1>
                    <p className="text-gray-500">
                        Historial de pasantías completadas
                    </p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:border-primary-blue"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">
                        🔍
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary-navy to-primary-slate">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    Nro
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    Nombre Pasantía
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    Empresa
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Horario y Fecha
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Promedio Final
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Informe Final
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Estado
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Calificar
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredInscripciones.map((ins, idx) => {
                                const p = ins.pasantia;
                                const promedio = ins.promedio;
                                const abandono = ins.abandono;
                                return (
                                    <tr
                                        key={ins.id_inscripcion}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {idx + 1}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {p.nombre}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                {p.empresa.nombre}
                                                <button
                                                    onClick={() =>
                                                        setModalEmpresa({
                                                            isOpen: true,
                                                            empresa: p.empresa,
                                                        })
                                                    }
                                                    className="text-primary-blue hover:text-primary-sky-blue"
                                                >
                                                    <Building2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-1 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    setModalHorario({
                                                        isOpen: true,
                                                        turno: p.turno,
                                                        cargaHoraria:
                                                            p.carga_horaria,
                                                        fechaIni: p.fecha_ini,
                                                        fechaFin: p.fecha_fin,
                                                    })
                                                }
                                                className="text-primary-blue hover:text-primary-sky-blue"
                                            >
                                                FECHA
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {abandono ? (
                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                                                    ABANDONO
                                                </span>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span
                                                        className={`inline-flex px-2 py-1 rounded-full text-base font-bold ${getPromedioColor(promedio, false)}`}
                                                    >
                                                        {promedio}/100
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            setModalDetallePromedio(
                                                                {
                                                                    isOpen: true,
                                                                    pasantiaId:
                                                                        p.id,
                                                                    pasantiaNombre:
                                                                        p.nombre,
                                                                },
                                                            )
                                                        }
                                                        className="text-primary-blue hover:text-primary-sky-blue text-sm flex items-center gap-1"
                                                    >
                                                        <Eye size={14} /> VER
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {abandono ? (
                                                <span className="text-gray-400 text-xs">
                                                    no disponible
                                                </span>
                                            ) : (
                                                <button className="text-primary-blue hover:text-primary-sky-blue">
                                                    <FileText size={18} />
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                FINALIZADO
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    abrirModalCalificar(ins)
                                                }
                                                className="flex items-center gap-1 mx-auto text-yellow-500 hover:text-yellow-600"
                                            >
                                                <Star size={18} />
                                                <span className="text-xs">
                                                    {ins.ya_califico
                                                        ? "Ver"
                                                        : "Calificar"}
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredInscripciones.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No hay pasantías finalizadas.
                    </div>
                )}
            </div>

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
                    })
                }
                turno={modalHorario.turno}
                cargaHoraria={modalHorario.cargaHoraria}
                fechaIni={modalHorario.fechaIni}
                fechaFin={modalHorario.fechaFin}
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
