// resources/js/Pages/Pasante/Inscripciones/Activas.jsx
import React, { useState } from "react";
import { Head } from "@inertiajs/react";
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
} from "lucide-react";

const bandera1 = 1;
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
    const getEstadoBadge = (estado) => {
        if (estado === "inscrito") {
            return (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-700 text-white">
                    POR INICIAR
                </span>
            );
        }
        if (estado === "iniciado") {
            return (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                    CURSANDO
                </span>
            );
        }
        return (
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-400 text-white">
                {estado}
            </span>
        );
    };

    return (
        <PasanteLayout auth={auth}>
            <Head title="Mis Inscripciones - Pasantías Inscritas" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-navy to-primary-slate px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        Pasantías Inscritas
                    </h2>
                    <p className="text-primary-sky-blue text-sm">
                        Pasantías en las que estás participando actualmente
                    </p>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary-navy to-primary-slate">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    Nombre Pasantía
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    Empresa
                                </th>
                                {/* <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    Mención
                                </th> */}
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Actividades
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Hrs./Fechas
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    Jefe Asignado
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Inscritos
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {inscripciones.map((inscripcion, index) => {
                                const p = inscripcion.pasantia;
                                return (
                                    <tr
                                        key={inscripcion.id_inscripcion}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {p.nombre}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <span>{p.empresa.nombre}</span>
                                                <button
                                                    onClick={() =>
                                                        setModales({
                                                            ...modales,
                                                            empresa: {
                                                                isOpen: true,
                                                                empresa:
                                                                    p.empresa,
                                                            },
                                                        })
                                                    }
                                                    className="text-primary-blue hover:text-primary-sky-blue"
                                                    title="Ver detalles de la empresa"
                                                >
                                                    <Building2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        {/* <td className="px-4 py-3 text-sm text-gray-600">
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {p.mencion}
                                            </span>
                                        </td> */}
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    setModales({
                                                        ...modales,
                                                        actividades: {
                                                            isOpen: true,
                                                            nombre: p.nombre,
                                                            actividades:
                                                                p.actividades,
                                                        },
                                                    })
                                                }
                                                className="text-primary-blue hover:text-primary-sky-blue"
                                                title="Ver actividades"
                                            >
                                                <CalendarIcon size={18} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    setModales({
                                                        ...modales,
                                                        horario: {
                                                            isOpen: true,
                                                            turno: p.turno,
                                                            cargaHoraria:
                                                                p.carga_horaria,
                                                            fechaIni:
                                                                p.fecha_ini,
                                                            fechaFin:
                                                                p.fecha_fin,
                                                        },
                                                    })
                                                }
                                                className="text-primary-blue hover:text-primary-sky-blue"
                                                title="Ver horario"
                                            >
                                                <Clock size={18} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {inscripcion.jefe_asignado ? (
                                                <div className="flex items-center gap-1">
                                                    <UserCheck
                                                        size={14}
                                                        className="text-green-600"
                                                    />
                                                    <span>
                                                        {
                                                            inscripcion
                                                                .jefe_asignado
                                                                .ap_paterno
                                                        }{" "}
                                                        {
                                                            inscripcion
                                                                .jefe_asignado
                                                                .ap_materno
                                                        }{" "}
                                                        {
                                                            inscripcion
                                                                .jefe_asignado
                                                                .nombre
                                                        }
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">
                                                    No Asignado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    setModales({
                                                        ...modales,
                                                        companeros: {
                                                            isOpen: true,
                                                            pasantiaId: p.id,
                                                            pasantiaNombre:
                                                                p.nombre,
                                                        },
                                                    })
                                                }
                                                className="flex items-center justify-center gap-1 mx-auto text-primary-blue hover:text-primary-sky-blue"
                                                title="Ver compañeros inscritos"
                                            >
                                                <Users size={16} />
                                                <span className="text-sm font-medium">
                                                    {p.total_inscritos}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getEstadoBadge(
                                                inscripcion.estado_inscripcion,
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {inscripciones.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No estás inscrito en ninguna pasantía actualmente.
                        <br />
                        <a
                            href="/pasante/inscribirse"
                            className="text-primary-blue hover:underline"
                        >
                            Haz clic aquí para ver las pasantías disponibles
                        </a>
                    </div>
                )}
            </div>

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
