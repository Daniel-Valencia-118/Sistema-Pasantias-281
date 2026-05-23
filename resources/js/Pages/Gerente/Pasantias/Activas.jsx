import React, { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import { Flag } from "lucide-react";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import ModalHorario from "@/Components/Common/ModalHorario";
import ModalActividadesPasantia from "@/Components/Common/ModalActividadesPasantia";
import ModalInscritosActivos from "@/Components/Common/ModalInscritosActivos";
import BadgeFecha from "@/Components/Common/BadgeFecha";
import axios from "axios";
import {
    Briefcase,
    Plus,
    Eye,
    Calendar,
    Users,
    Clock,
    Search,
    ArrowUpDown,
    AlertTriangle,
    CheckCircle,
    ChevronUp,
    ChevronDown,
    Play,
} from "lucide-react";

export default function Activas({ auth, pasantias }) {
    const [pasantiasData, setPasantiasData] = useState(pasantias);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("fecha_ini");
    const [sortDirection, setSortDirection] = useState("asc");
    const [modalFinalizar, setModalFinalizar] = useState({
        isOpen: false,
        pasantiaId: null,
        infoFin: null,
    });
    const [loadingFinalizar, setLoadingFinalizar] = useState(false);
    const [modalDetalles, setModalDetalles] = useState({
        isOpen: false,
        pasantia: null,
    });
    const [modalActividades, setModalActividades] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
        pasantiaFechaIni: null,
        pasantiaFechaFin: null,
    });
    const [modalHorario, setModalHorario] = useState({
        isOpen: false,
        turno: null,
        cargaHoraria: null,
        fechaIni: null,
        fechaFin: null,
    });
    const [modalInscritos, setModalInscritos] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };
    // Función para obtener info de fin
    const handleAbrirConfirmacionFin = async (pasantiaId) => {
        try {
            const response = await axios.get(
                `/gerente/pasantias-activas/${pasantiaId}/info-fin`,
            );
            setModalFinalizar({
                isOpen: true,
                pasantiaId: pasantiaId,
                infoFin: response.data,
            });
        } catch (error) {
            alert("Error al verificar condiciones");
        }
    };
    const SortIcon = ({ field }) => {
        if (sortField !== field)
            return <ArrowUpDown size={14} className="text-gray-400" />;
        return sortDirection === "asc" ? (
            <ChevronUp size={14} />
        ) : (
            <ChevronDown size={14} />
        );
    };
    // Función para finalizar
    const handleFinalizarPasantia = async () => {
        setLoadingFinalizar(true);
        try {
            const response = await axios.patch(
                `/gerente/pasantias-activas/${modalFinalizar.pasantiaId}/finalizar`,
            );
            if (response.data.message) {
                window.location.reload();
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Error al finalizar la pasantía",
            );
            setModalFinalizar({
                isOpen: false,
                pasantiaId: null,
                infoFin: null,
            });
        } finally {
            setLoadingFinalizar(false);
        }
    };
    // Determinar el mensaje de confirmación para finalizar
    const getMensajeFinalizacion = (infoFin) => {
        if (!infoFin) return "";
        if (infoFin.hay_inscripciones_no_finalizadas) {
            return "Existen pasantes inscritos que aún no han finalizado su inscripción, ¿Desea finalizar la pasantía?";
        }
        if (infoFin.fecha_actual_es_menor) {
            return `¿Finalizar a pesar de que faltan ${Math.round(infoFin.dias_restantes)} días para que termine la pasantía?`;
        }
        return "¿Desea finalizar la pasantía?";
    };
    const filteredAndSortedData = useMemo(() => {
        let filtered = [...pasantiasData];

        if (searchTerm) {
            filtered = filtered.filter((p) =>
                p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === "fecha_ini") {
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

    return (
        <GerenteLayout auth={auth}>
            <Head title="Pasantías Iniciadas" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-navy to-primary-slate px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Play size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                PASANTÍAS INICIADAS
                            </h2>
                            <p className="text-white/70 text-sm mt-0.5 flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                Lista de pasantías en curso, gestiona a tus
                                pasantes y asígnales actividades.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Barra de búsqueda */}
                <div className="p-4 border-b">
                    <div className="relative w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Buscar por nombre de pasantía..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary-navy to-primary-slate">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white">
                                    #
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("nombre")}
                                >
                                    <div className="flex items-center gap-1">
                                        NOMBRE PASANTÍA{" "}
                                        <SortIcon field="nombre" />
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    MENCIÓN
                                </th>

                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Fechas/Hrs.
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    ACTIVIDADES
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    PASANTES
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    ESTADO
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("fecha_fin")}
                                >
                                    <div className="flex items-center gap-1">
                                        FECHA FIN <SortIcon field="fecha_fin" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    FINALIZAR
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedData.map((pasantia, index) => (
                                <tr
                                    key={pasantia.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-1 py-3 text-center text-xs text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {pasantia.nombre}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span className="inline-flex px-2.5 py-1 text-xs font-medium text-primary-blue bg-primary-blue/10 rounded-lg border border-primary-blue/20">
                                            {pasantia.mencion}
                                        </span>
                                    </td>

                                    <td className="px-3 py-3 text-center">
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
                                                })
                                            }
                                            className="flex flex-col items-center gap-0.5 mx-auto text-primary-blue hover:text-primary-sky-blue transition-colors group"
                                            title="Ver horario y fechas"
                                        >
                                            <Clock
                                                size={22}
                                                className="text-primary-blue group-hover:text-primary-sky-blue"
                                            />
                                            <span className="text-[12px] font-medium text-primary-blue/80 group-hover:text-primary-sky-blue transition-colors">
                                                Fechas/Horario
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalActividades({
                                                    isOpen: true,
                                                    pasantiaId: pasantia.id,
                                                    pasantiaNombre:
                                                        pasantia.nombre,
                                                    pasantiaFechaIni:
                                                        pasantia.fecha_ini,
                                                    pasantiaFechaFin:
                                                        pasantia.fecha_fin,
                                                })
                                            }
                                            className="flex flex-col items-center gap-0.5 mx-auto text-primary-blue hover:text-primary-sky-blue transition-colors group"
                                            title="Ver actividades de la pasantía"
                                        >
                                            <Calendar
                                                size={22}
                                                className="text-primary-blue group-hover:text-primary-sky-blue"
                                            />
                                            <span className="text-[12px] font-medium text-primary-blue/80 group-hover:text-primary-sky-blue transition-colors">
                                                Actividades
                                            </span>
                                        </button>
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <button
                                                onClick={() =>
                                                    setModalInscritos({
                                                        isOpen: true,
                                                        pasantiaId: pasantia.id,
                                                        pasantiaNombre:
                                                            pasantia.nombre,
                                                    })
                                                }
                                                className="text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer flex items-center justify-center gap-1"
                                                title="Ver inscritos"
                                            >
                                                <Users size={20} />
                                                <span className="text-base font-semibold">
                                                    {pasantia.inscritos}
                                                </span>
                                            </button>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-bold text-green-600">
                                                    +
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                                    ASIGNAR
                                                </span>
                                                <span className="text-xs font-bold text-red-600">
                                                    -
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        {(() => {
                                            const { todos_con_jefe } = pasantia;
                                            if (todos_con_jefe) {
                                                return (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle
                                                            size={12}
                                                        />{" "}
                                                        En Orden
                                                    </span>
                                                );
                                            } else {
                                                return (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <AlertTriangle
                                                            size={12}
                                                        />{" "}
                                                        Falta Asignar Jefe
                                                    </span>
                                                );
                                            }
                                        })()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200">
                                            <BadgeFecha
                                                fecha={pasantia.fecha_fin}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                handleAbrirConfirmacionFin(
                                                    pasantia.id,
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-300 rounded-lg transition-all duration-200 font-medium text-sm cursor-pointer shadow-sm hover:shadow"
                                            title="Finalizar pasantía"
                                        >
                                            <Flag
                                                size={14}
                                                className="text-orange-600"
                                            />
                                            Finalizar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAndSortedData.length === 0 && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                            <Briefcase size={32} className="text-gray-400" />
                        </div>

                        {pasantiasData.length === 0 ? (
                            // No hay pasantías en absoluto
                            <>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    No hay pasantías iniciadas
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Aún no has iniciado ninguna pasantía
                                    publicada. ¿Deseas iniciar una?
                                </p>
                                <a
                                    href="/gerente/pasantias/"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-blue to-primary-sky-blue text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                                >
                                    <Play size={18} />
                                    Iniciar una nueva pasantia
                                </a>
                            </>
                        ) : (
                            // Hay pasantías pero no coinciden con los filtros
                            <>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    No se encontraron resultados
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    No hay pasantías que coincidan con tu
                                    búsqueda.
                                </p>
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                                >
                                    <Search size={16} />
                                    Limpiar búsqueda
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            {/* Modales reutilizables */}

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

            <ModalActividadesPasantia
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
                esActiva={true}
                onUpdate={() => {}}
            />

            <ModalConfirmacion
                isOpen={modalFinalizar.isOpen}
                onClose={() =>
                    setModalFinalizar({
                        isOpen: false,
                        pasantiaId: null,
                        infoFin: null,
                    })
                }
                onConfirm={handleFinalizarPasantia}
                titulo="Finalizar Pasantía"
                mensaje={getMensajeFinalizacion(modalFinalizar.infoFin)}
                type={
                    modalFinalizar.infoFin?.hay_inscripciones_no_finalizadas
                        ? "warning"
                        : "info"
                }
                confirmText="Finalizar"
                loading={loadingFinalizar}
            />
            <ModalInscritosActivos
                isOpen={modalInscritos.isOpen}
                onClose={() =>
                    setModalInscritos({
                        isOpen: false,
                        pasantiaId: null,
                        pasantiaNombre: null,
                    })
                }
                pasantiaId={modalInscritos.pasantiaId}
                pasantiaNombre={modalInscritos.pasantiaNombre}
            />
        </GerenteLayout>
    );
}
