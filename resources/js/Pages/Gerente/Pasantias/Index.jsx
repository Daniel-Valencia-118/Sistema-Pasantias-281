import React, { useState, useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Play, Flag } from "lucide-react";
import ModalConfirmacion from "@/Components/Common/ModalConfirmacion";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import ModalDetallesPasantia from "@/Components/Common/ModalDetallesPasantia";
import ModalActividadesPasantia from "@/Components/Common/ModalActividadesPasantia";
import ModalInscritos from "@/Components/Common/ModalInscritos";
import axios from "axios";
import {
    Eye,
    Calendar,
    Users,
    Award,
    AlertTriangle,
    CheckCircle,
    Minus,
    Plus,
    XCircle,
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
} from "lucide-react";

export default function Index({ auth, pasantias }) {
    const [pasantiasData, setPasantiasData] = useState(pasantias);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("fecha_ini");
    const [sortDirection, setSortDirection] = useState("asc");
    const [modalDetalles, setModalDetalles] = useState({
        isOpen: false,
        pasantia: null,
    });
    const [modalActividades, setModalActividades] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });
    const [modalIniciar, setModalIniciar] = useState({
        isOpen: false,
        pasantiaId: null,
        infoInicio: null,
    });
    const [loadingIniciar, setLoadingIniciar] = useState(false);
    const formatDate = (date) => {
        if (!date) return "-";
        return date.split("-").reverse().join("/");
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
    const [modalInscritos, setModalInscritos] = useState({
        isOpen: false,
        pasantiaId: null,
        pasantiaNombre: null,
    });
    // Función para obtener info de inicio
    const handleAbrirConfirmacionInicio = async (pasantiaId) => {
        try {
            const response = await axios.get(
                `/gerente/pasantias/${pasantiaId}/info-inicio`,
            );
            setModalIniciar({
                isOpen: true,
                pasantiaId: pasantiaId,
                infoInicio: response.data,
            });
        } catch (error) {
            alert("Error al verificar fechas");
        }
    };
    const filteredAndSortedData = useMemo(() => {
        let filtered = [...pasantiasData];

        // Búsqueda por nombre
        if (searchTerm) {
            filtered = filtered.filter((p) =>
                p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        // Ordenamiento
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

            // Segundo orden por nombre
            if (a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1;
            if (a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1;
            return 0;
        });

        return filtered;
    }, [pasantiasData, searchTerm, sortField, sortDirection]);

    const handleCuposChange = async (id, nuevoCupos, inscritos) => {
        if (nuevoCupos < inscritos) {
            alert(
                `No puedes reducir los cupos por debajo de los inscritos (${inscritos})`,
            );
            return;
        }

        if (
            confirm(
                `¿Estás seguro de ${nuevoCupos > 0 ? "aumentar" : "disminuir"} los cupos?`,
            )
        ) {
            try {
                const response = await axios.patch(
                    `/gerente/pasantias/${id}/cupos`,
                    { cupos: nuevoCupos },
                );
                if (response.data.message) {
                    setPasantiasData((prev) =>
                        prev.map((p) =>
                            p.id === id
                                ? {
                                      ...p,
                                      cupos: response.data.cupos,
                                      cupos_disponibles:
                                          response.data.cupos_disponibles,
                                  }
                                : p,
                        ),
                    );
                }
            } catch (error) {
                alert(
                    error.response?.data?.message ||
                        "Error al actualizar cupos",
                );
            }
        }
    };

    const handleCancelarPasantia = async (id) => {
        if (
            confirm(
                "¿Estás seguro de cancelar esta pasantía? Esta acción no se puede deshacer.",
            )
        ) {
            try {
                await axios.patch(`/gerente/pasantias/${id}/cancelar`);
                setPasantiasData((prev) => prev.filter((p) => p.id !== id));
            } catch (error) {
                alert(error.response?.data?.message || "Error al cancelar");
            }
        }
    };
    // Función para iniciar
    const handleIniciarPasantia = async () => {
        setLoadingIniciar(true);
        try {
            const response = await axios.patch(
                `/gerente/pasantias/${modalIniciar.pasantiaId}/iniciar`,
            );
            if (response.data.message) {
                window.location.reload();
            }
        } catch (error) {
            alert(
                error.response?.data?.message || "Error al iniciar la pasantía",
            );
            setModalIniciar({
                isOpen: false,
                pasantiaId: null,
                infoInicio: null,
            });
        } finally {
            setLoadingIniciar(false);
        }
    };

    const getEstadoBadge = (pasantia) => {
        const { cupos_disponibles, inscritos, todos_con_jefe, cupos } =
            pasantia;

        // PEOR ESTADO: No hay inscritos
        if (inscritos === 0) {
            return {
                text: "Sin Inscritos",
                bg: "bg-red-100",
                textColor: "text-red-800",
                icon: <Award size={12} />,
                showCancel: true,
            };
        }

        // MEJOR ESTADO: Cupos disponibles = 0 Y todos tienen jefe
        if (cupos_disponibles === 0 && todos_con_jefe) {
            return {
                text: "Todo Listo",
                bg: "bg-green-100",
                textColor: "text-green-800",
                icon: <CheckCircle size={12} />,
                showCancel: false,
            };
        }

        // NORMAL: Cupos disponibles = 0 pero no todos tienen jefe
        if (cupos_disponibles === 0 && !todos_con_jefe) {
            return {
                text: "Falta Asignar Jefe",
                bg: "bg-yellow-100",
                textColor: "text-yellow-800",
                icon: <AlertTriangle size={12} />,
                showCancel: false,
            };
        }
        if (cupos_disponibles > 0 && !todos_con_jefe) {
            return {
                text: "Falta Asignar Jefe",
                bg: "bg-yellow-100",
                textColor: "text-yellow-800",
                icon: <AlertTriangle size={12} />,
                showCancel: false,
            };
        }
        // NORMAL: Cupos disponibles > 0 pero todos tienen jefe
        if (cupos_disponibles > 0 && todos_con_jefe) {
            return {
                text: "Falta Completar Cupos",
                bg: "bg-blue-100",
                textColor: "text-blue-800",
                icon: <AlertTriangle size={12} />,
                showCancel: false,
            };
        }

        // Estado por defecto (no debería llegar aquí)
        return {
            text: "Pendiente",
            bg: "bg-gray-100",
            textColor: "text-gray-800",
            icon: null,
            showCancel: false,
        };
    };

    return (
        <GerenteLayout auth={auth}>
            <Head title="Pasantías Publicadas" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-navy to-primary-slate px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        Pasantías Publicadas
                    </h2>
                    <p className="text-primary-sky-blue text-sm">
                        Pasantías en estado ABIERTA
                    </p>
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
                                    Nro
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("nombre")}
                                >
                                    <div className="flex items-center gap-1">
                                        Nombre <SortIcon field="nombre" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-white cursor-pointer hover:bg-white/10"
                                    onClick={() => handleSort("fecha_ini")}
                                >
                                    <div className="flex items-center gap-1">
                                        Fecha Inicio{" "}
                                        <SortIcon field="fecha_ini" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Detalles
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Actividades
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Cupos Disponibles
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Inscritos
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Estado
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white">
                                    Iniciar
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedData.map((pasantia, index) => (
                                <tr
                                    key={pasantia.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {pasantia.nombre}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {formatDate(pasantia.fecha_ini)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalDetalles({
                                                    isOpen: true,
                                                    pasantia: pasantia,
                                                })
                                            }
                                            className="text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer"
                                            title="Ver detalles"
                                        >
                                            <Eye size={18} />
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
                                                })
                                            }
                                            className="text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer"
                                            title="Ver actividades"
                                        >
                                            <Calendar size={18} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    handleCuposChange(
                                                        pasantia.id,
                                                        pasantia.cupos - 1,
                                                        pasantia.inscritos,
                                                    )
                                                }
                                                disabled={
                                                    pasantia.cupos <=
                                                    pasantia.inscritos
                                                }
                                                className="p-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-medium">
                                                {pasantia.cupos_disponibles}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleCuposChange(
                                                        pasantia.id,
                                                        pasantia.cupos + 1,
                                                        pasantia.inscritos,
                                                    )
                                                }
                                                className="p-1 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                setModalInscritos({
                                                    isOpen: true,
                                                    pasantiaId: pasantia.id,
                                                    pasantiaNombre:
                                                        pasantia.nombre,
                                                })
                                            }
                                            className="text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto"
                                            title="Ver inscritos"
                                        >
                                            <Users size={16} />
                                            <span className="text-sm">
                                                {pasantia.inscritos}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {(() => {
                                            const estado =
                                                getEstadoBadge(pasantia);
                                            return (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${estado.bg} ${estado.textColor}`}
                                                    >
                                                        {estado.icon}
                                                        {estado.text}
                                                    </span>
                                                    {estado.showCancel && (
                                                        <button
                                                            onClick={() =>
                                                                handleCancelarPasantia(
                                                                    pasantia.id,
                                                                )
                                                            }
                                                            className="text-red-500 hover:text-red-700 transition-all"
                                                            title="Cancelar pasantía"
                                                        >
                                                            <XCircle
                                                                size={16}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                handleAbrirConfirmacionInicio(
                                                    pasantia.id,
                                                )
                                            }
                                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all cursor-pointer"
                                            title="Iniciar pasantía"
                                        >
                                            <Play size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAndSortedData.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No hay pasantías que coincidan con la búsqueda
                    </div>
                )}
            </div>
            {/* Modales */}
            <ModalDetallesPasantia
                isOpen={modalDetalles.isOpen}
                onClose={() =>
                    setModalDetalles({ isOpen: false, pasantia: null })
                }
                pasantia={modalDetalles.pasantia}
            />
            <ModalInscritos
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

            <ModalConfirmacion
                isOpen={modalIniciar.isOpen}
                onClose={() =>
                    setModalIniciar({
                        isOpen: false,
                        pasantiaId: null,
                        infoInicio: null,
                    })
                }
                onConfirm={handleIniciarPasantia}
                titulo="Iniciar Pasantía"
                mensaje={
                    modalIniciar.infoInicio?.fecha_actual_es_menor
                        ? `¿Iniciar a pesar de que faltan ${Math.round(modalIniciar.infoInicio?.dias_restantes)} días para el inicio de la pasantía?`
                        : "¿Desea Iniciar la pasantía?"
                }
                type="info"
                confirmText="Iniciar"
                loading={loadingIniciar}
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
                onUpdate={() => {
                    // En lugar de recargar la página, no hagas nada aquí
                    // o actualiza solo el estado local si necesitas reflejar cambios en la tabla
                }}
            />
        </GerenteLayout>
    );
}
