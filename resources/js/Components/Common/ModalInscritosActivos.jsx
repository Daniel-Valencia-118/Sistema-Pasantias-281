import React, { useState, useEffect } from "react";
import {
    X,
    Search,
    Eye,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
    Users,
    ClipboardList,
    UserCheck,
    UserX,
} from "lucide-react";
import axios from "axios";
import ModalPerfil from "./ModalPerfil";
import ModalEvaluacionActividad from "./ModalEvaluacionActividad";
import ModalActividadesEvaluadas from "./ModalActividadesEvaluadas";
import ModalAsignarJefe from "./ModalAsignarJefe";
import ModalConfirmacion from "./ModalConfirmacion";
import BadgeEstadoCalificacion from "./BadgeEstadoCalificacion";
import { formatDateToSpanish } from "@/Utils/dateUtils";

export default function ModalInscritosActivos({
    isOpen,
    onClose,
    pasantiaId,
    pasantiaNombre,
    Users,
}) {
    const [inscritos, setInscritos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("ap_paterno");
    const [sortDirection, setSortDirection] = useState("asc");
    const [modalPerfil, setModalPerfil] = useState({
        isOpen: false,
        usuario: null,
        tipo: "pasante",
    });
    const handleVerEvaluacion = (actividad, evaluacion, pasante) => {
        setModalEvaluacion({
            isOpen: true,
            actividad: actividad,
            evaluacion: evaluacion,
            pasante: pasante,
        });
    };
    const [modalActividadesEvaluadas, setModalActividadesEvaluadas] = useState({
        isOpen: false,
        pasante: null,
    });
    const [modalAsignarJefe, setModalAsignarJefe] = useState({
        isOpen: false,
        pasante: null,
    });
    const [modalConfirm, setModalConfirm] = useState({
        isOpen: false,
        accion: null,
        pasante: null,
    });

    useEffect(() => {
        if (isOpen && pasantiaId) {
            cargarInscritos();
        }
    }, [isOpen, pasantiaId]);

    const cargarInscritos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/gerente/pasantias-activas/${pasantiaId}/inscritos`,
            );
            setInscritos(response.data.inscritos);
            setActividades(response.data.actividades);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar los inscritos");
        } finally {
            setLoading(false);
        }
    };

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
            <ChevronUp size={14} />
        ) : (
            <ChevronDown size={14} />
        );
    };

    const handleDesignarJefe = (pasante) => {
        setModalConfirm({ isOpen: true, accion: "designar", pasante: pasante });
    };

    const confirmDesignar = async () => {
        try {
            await axios.patch(
                `/gerente/pasantias/${pasantiaId}/designar-jefe/${modalConfirm.pasante.idU_pasante}`,
            );
            await cargarInscritos();
            setModalConfirm({ isOpen: false, accion: null, pasante: null });
        } catch (error) {
            alert(error.response?.data?.message || "Error al desasignar jefe");
        }
    };

    const handleAsignarJefe = (pasante) => {
        setModalAsignarJefe({ isOpen: true, pasante: pasante });
    };

    const handleJefeAsignado = () => {
        cargarInscritos();
        setModalAsignarJefe({ isOpen: false, pasante: null });
    };

    const filteredAndSorted = [...inscritos]
        .filter((i) => {
            const fullName =
                `${i.ap_paterno} ${i.ap_materno} ${i.nombre}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            if (typeof aVal === "string") {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
                <div className="bg-white rounded-2xl border border-gray-200 max-w-7xl w-full overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white">
                                    Pasantes Inscritos
                                </h3>

                                <p className="text-white/80 text-base mt-0.5 font-medium">
                                    {pasantiaNombre}
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="bg-gray-50 p-6 max-h-[70vh] overflow-y-auto">
                        {/* Buscador */}
                        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                    Lista de Pasantes Inscritos
                                </h4>

                                <p className="text-base text-gray-500">
                                    Total Inscritos:{" "}
                                    <span className="font-semibold text-gray-700">
                                        {filteredAndSorted.length}
                                    </span>
                                </p>
                            </div>

                            <div className="relative w-full md:w-96">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    placeholder="Buscar por apellido o nombre..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-blue"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-blue rounded-full animate-spin"></div>

                                <p className="mt-4 text-gray-500 font-medium">
                                    Cargando pasantes...
                                </p>
                            </div>
                        ) : filteredAndSorted.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <UserX
                                        size={28}
                                        className="text-gray-400"
                                    />
                                </div>

                                <h4 className="text-lg font-semibold text-gray-700">
                                    No hay pasantes activos
                                </h4>

                                <p className="mt-2 text-sm text-gray-500">
                                    Todavía no existen registros activos para
                                    esta pasantía.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-separate border-spacing-0">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-primary-navy to-primary-slate">
                                                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Nro
                                                </th>

                                                <th
                                                    className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10"
                                                    onClick={() =>
                                                        handleSort("ap_paterno")
                                                    }
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Apellido Paterno
                                                        <SortIcon field="ap_paterno" />
                                                    </div>
                                                </th>

                                                <th
                                                    className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10"
                                                    onClick={() =>
                                                        handleSort("ap_materno")
                                                    }
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Apellido Materno
                                                        <SortIcon field="ap_materno" />
                                                    </div>
                                                </th>

                                                <th
                                                    className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10"
                                                    onClick={() =>
                                                        handleSort("nombre")
                                                    }
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Nombres
                                                        <SortIcon field="nombre" />
                                                    </div>
                                                </th>

                                                <th
                                                    className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10"
                                                    onClick={() =>
                                                        handleSort("ci")
                                                    }
                                                >
                                                    <div className="flex items-center gap-1">
                                                        CI
                                                        <SortIcon field="ci" />
                                                    </div>
                                                </th>

                                                <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Datos
                                                </th>

                                                <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Actividades
                                                </th>

                                                <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white">
                                                    Jefe de Pasante
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="bg-white">
                                            {filteredAndSorted.map(
                                                (inscrito, index) => (
                                                    <tr
                                                        key={inscrito.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-4 border-b border-gray-100">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                                                {index + 1}
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-4 text-sm font-medium text-gray-800 border-b border-gray-100">
                                                            {
                                                                inscrito.ap_paterno
                                                            }
                                                        </td>

                                                        <td className="px-4 py-4 text-sm font-medium text-gray-800 border-b border-gray-100">
                                                            {
                                                                inscrito.ap_materno
                                                            }
                                                        </td>

                                                        <td className="px-4 py-4 text-sm font-medium text-gray-800 border-b border-gray-100">
                                                            {inscrito.nombre}
                                                        </td>

                                                        <td className="px-4 py-4 text-sm text-gray-600 border-b border-gray-100">
                                                            {inscrito.ci}
                                                        </td>

                                                        <td className="px-4 py-4 text-center border-b border-gray-100">
                                                            <button
                                                                onClick={() =>
                                                                    setModalPerfil(
                                                                        {
                                                                            isOpen: true,
                                                                            usuario:
                                                                                inscrito,
                                                                            tipo: "pasante",
                                                                        },
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-blue text-white text-xs font-semibold rounded-lg hover:bg-primary-sky-blue transition-all duration-200"
                                                                title="Ver perfil del pasante"
                                                            >
                                                                <Eye
                                                                    size={19}
                                                                />
                                                                Ver
                                                            </button>
                                                        </td>

                                                        <td className="px-4 py-4 text-center border-b border-gray-100">
                                                            <button
                                                                onClick={() =>
                                                                    setModalActividadesEvaluadas(
                                                                        {
                                                                            isOpen: true,
                                                                            pasante:
                                                                                inscrito,
                                                                        },
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-blue text-white text-xs font-semibold rounded-xl hover:bg-primary-sky-blue"
                                                                title="Ver actividades evaluadas"
                                                            >
                                                                <ClipboardList
                                                                    size={15}
                                                                />
                                                                Ver Evaluaciones
                                                            </button>
                                                        </td>

                                                        <td className="px-4 py-4 text-center border-b border-gray-100">
                                                            {inscrito.jefe ? (
                                                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                                                    <button
                                                                        onClick={() =>
                                                                            setModalPerfil(
                                                                                {
                                                                                    isOpen: true,
                                                                                    usuario:
                                                                                        inscrito.jefe,
                                                                                    tipo: "jefe",
                                                                                },
                                                                            )
                                                                        }
                                                                        className="px-3 py-1.5 bg-blue-50 text-primary-blue rounded-lg text-sm font-medium hover:bg-blue-100"
                                                                        title="Ver perfil del jefe"
                                                                    >
                                                                        {
                                                                            inscrito
                                                                                .jefe
                                                                                .ap_paterno
                                                                        }{" "}
                                                                        {
                                                                            inscrito
                                                                                .jefe
                                                                                .ap_materno
                                                                        }
                                                                        {", "}
                                                                        {
                                                                            inscrito
                                                                                .jefe
                                                                                .nombre
                                                                        }
                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            handleDesignarJefe(
                                                                                inscrito,
                                                                            )
                                                                        }
                                                                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500 text-white hover:bg-red-600"
                                                                        title="Desasignar jefe"
                                                                    >
                                                                        <UserX
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        handleAsignarJefe(
                                                                            inscrito,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-blue text-white text-xs font-semibold rounded-xl hover:bg-primary-sky-blue"
                                                                >
                                                                    <UserCheck
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                    Asignar
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
                        <div className="text-sm text-gray-500">
                            Mostrando{" "}
                            <span className="font-semibold text-gray-700">
                                {filteredAndSorted.length}
                            </span>{" "}
                            registros
                        </div>

                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-600 text-white text-sm font-semibold rounded-xl hover:bg-gray-700"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <ModalPerfil
                isOpen={modalPerfil.isOpen}
                onClose={() =>
                    setModalPerfil({
                        isOpen: false,
                        usuario: null,
                        tipo: "pasante",
                    })
                }
                usuario={modalPerfil.usuario}
                tipo={modalPerfil.tipo}
                readOnly={true}
            />

            <ModalActividadesEvaluadas
                isOpen={modalActividadesEvaluadas.isOpen}
                onClose={() =>
                    setModalActividadesEvaluadas({
                        isOpen: false,
                        pasante: null,
                    })
                }
                pasante={modalActividadesEvaluadas.pasante}
                actividades={actividades || []}
            />

            <ModalAsignarJefe
                isOpen={modalAsignarJefe.isOpen}
                onClose={() =>
                    setModalAsignarJefe({
                        isOpen: false,
                        pasante: null,
                    })
                }
                pasante={modalAsignarJefe.pasante}
                pasantiaId={pasantiaId}
                onAsignado={handleJefeAsignado}
            />

            <ModalConfirmacion
                isOpen={modalConfirm.isOpen}
                onClose={() =>
                    setModalConfirm({
                        isOpen: false,
                        accion: null,
                        pasante: null,
                    })
                }
                onConfirm={confirmDesignar}
                titulo="Desasignar Jefe"
                mensaje={`¿Estás seguro de desasignar al jefe de ${modalConfirm.pasante?.nombre} ${modalConfirm.pasante?.ap_paterno}?`}
                type="danger"
                confirmText="Designar"
            />
        </>
    );
}
